import pool from "../database.js"

const dataKeys = [
    "transactions",
    "customTransactionTypes",
    "habits",
    "notes",
    "events",
    "workouts"
]

export function normalizeData(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return Object.fromEntries(dataKeys.map(key => [key, []]))
    }

    return Object.fromEntries(
        dataKeys.map(key => [key, Array.isArray(value[key]) ? value[key] : []])
    )
}

function mergeRecords(existing, incoming) {
    const records = new Map()
    for (const record of [...existing, ...incoming]) {
        if (!record || typeof record !== "object" || typeof record.id !== "string") continue
        const previous = records.get(record.id)
        records.set(record.id, {
            ...previous,
            ...record,
            ...(previous?.checks && record.checks
                ? {checks: {...previous.checks, ...record.checks}}
                : {}),
            ...(previous?.sessions && record.sessions
                ? {sessions: {...previous.sessions, ...record.sessions}}
                : {}),
            ...(previous?.exercises && record.exercises
                ? {exercises: mergeRecords(previous.exercises, record.exercises)}
                : {})
        })
    }
    return [...records.values()]
}

async function replaceMappedRecords(client, userId, data) {
    const mappings = await client.query(
        "SELECT COLLECTION, RECORD_ID FROM USER_APP_RECORDS WHERE USER_ID = $1",
        [userId]
    )
    const idsByCollection = new Map()
    for (const mapping of mappings.rows) {
        const ids = idsByCollection.get(mapping.collection) || []
        ids.push(mapping.record_id)
        idsByCollection.set(mapping.collection, ids)
    }

    const deletes = [
        ["exercises", "EXERCICIOS"],
        ["habitDays", "DIAS_HABITOS"],
        ["transactions", "FINANCIAS"],
        ["notes", "AGENDA"],
        ["events", "CALENDARIO"],
        ["habits", "HABITOS"],
        ["workouts", "TREINOS"]
    ]
    for (const [collection, table] of deletes) {
        const ids = idsByCollection.get(collection)
        if (ids?.length) {
            await client.query(`DELETE FROM ${table} WHERE ID = ANY($1::int[])`, [ids])
        }
    }
    await client.query("DELETE FROM USER_APP_RECORDS WHERE USER_ID = $1", [userId])

    const mapRecord = async (collection, clientId, recordId) => {
        await client.query(`
            INSERT INTO USER_APP_RECORDS (USER_ID, COLLECTION, CLIENT_ID, RECORD_ID)
            VALUES ($1, $2, $3, $4)
        `, [userId, collection, String(clientId), recordId])
    }

    const insertRecord = async (collection, query, params) => {
        const result = await client.query(query, params)
        const record = result.rows[0]
        if (!record) throw new Error(`Falha ao sincronizar registro de ${collection}`)
        await mapRecord(collection, record.client_id, record.id)
        return record.id
    }

    const habits = new Map()
    for (const habit of data.habits) {
        if (!habit || typeof habit.id !== "string" || typeof habit.name !== "string") continue
        const id = await insertRecord(
            "habits",
            `INSERT INTO HABITOS (ID_USER, HABITO)
             VALUES ($1, $2)
             RETURNING ID AS id, $3::text AS client_id`,
            [Number(userId), habit.name, habit.id]
        )
        habits.set(habit.id, id)

        if (habit.checks && typeof habit.checks === "object") {
            for (const [date, checked] of Object.entries(habit.checks)) {
                if (!checked) continue
                await insertRecord(
                    "habitDays",
                    `INSERT INTO DIAS_HABITOS (ID_HABITO, ID_USER, DATA)
                     VALUES ($1, $2, $3::date)
                     RETURNING ID AS id, $4::text AS client_id`,
                    [id, Number(userId), date, `${habit.id}:${date}`]
                )
            }
        }
    }

    for (const transaction of data.transactions) {
        if (!transaction || typeof transaction.id !== "string") continue
        await insertRecord(
            "transactions",
            `INSERT INTO FINANCIAS (ID_USER, TIPO, DESCRICAO, CATEGORIA, VALOR, DATA)
             VALUES ($1, $2, $3, $4, $5, $6::date)
             RETURNING ID AS id, $7::text AS client_id`,
            [
                Number(userId),
                transaction.type,
                transaction.title,
                transaction.category,
                transaction.amount,
                transaction.date,
                transaction.id
            ]
        )
    }

    for (const note of data.notes) {
        if (!note || typeof note.id !== "string") continue
        await insertRecord(
            "notes",
            `INSERT INTO AGENDA (ID_USER, TITULO, ANOTACAO, DATA)
             VALUES ($1, $2, $3, $4::date)
             RETURNING ID AS id, $5::text AS client_id`,
            [Number(userId), note.title, note.content, note.date, note.id]
        )
    }

    for (const event of data.events) {
        if (!event || typeof event.id !== "string") continue
        await insertRecord(
            "events",
            `INSERT INTO CALENDARIO (ID_USER, TITULO, DATA, HORARIO, DESCRICAO)
             VALUES ($1, $2, $3::date, $4::time, $5)
             RETURNING ID AS id, $6::text AS client_id`,
            [
                Number(userId),
                event.title,
                event.date,
                event.time || "00:00",
                event.description || "",
                event.id
            ]
        )
    }

    for (const workout of data.workouts) {
        if (!workout || typeof workout.id !== "string") continue
        const workoutId = await insertRecord(
            "workouts",
            `INSERT INTO TREINOS (USER_ID, NOME_TREINO, DIA_TREINO)
             VALUES ($1, $2, $3)
             RETURNING ID AS id, $4::text AS client_id`,
            [
                Number(userId),
                workout.title,
                Array.isArray(workout.days) ? workout.days.join(",") : "",
                workout.id
            ]
        )

        for (const exercise of Array.isArray(workout.exercises) ? workout.exercises : []) {
            if (!exercise || typeof exercise.id !== "string") continue
            await insertRecord(
                "exercises",
                `INSERT INTO EXERCICIOS (TREINO_ID, NOME, SERIES, REPETICOES)
                 VALUES ($1, $2, $3, $4)
                 RETURNING ID AS id, $5::text AS client_id`,
                [
                    workoutId,
                    exercise.name,
                    exercise.sets,
                    exercise.reps,
                    `${workout.id}:${exercise.id}`
                ]
            )
        }
    }
}

export function mergeData(existing, incoming) {
    const current = normalizeData(existing)
    const imported = normalizeData(incoming)
    return Object.fromEntries(
        dataKeys.map(key => [key, mergeRecords(current[key], imported[key])])
    )
}

export function validData(data) {
    return data && typeof data === "object" && !Array.isArray(data) &&
        dataKeys.every(key => data[key] === undefined || Array.isArray(data[key]))
}

export async function CurrentUser(req, res) {
    try {
        const result = await pool.query(
            "SELECT ID, NAME, EMAIL, STATUS FROM USERS WHERE ID = $1",
            [req.user.id]
        )
        if (result.rows.length === 0) {
            return res.status(404).json({response: "Usuário não encontrado"})
        }
        res.status(200).json({response: result.rows[0]})
    } catch (err) {
        console.error("Falha ao carregar usuário autenticado:", err)
        res.status(500).json({response: "Erro no servidor"})
    }
}

export async function GetUserData(req, res) {
    let client
    try {
        client = await pool.connect()
        await client.query("BEGIN")
        const userId = String(req.user.id)
        await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [userId])
        const result = await client.query(
            `SELECT DATA, UPDATED_AT, RELATIONAL_SYNCED_AT
             FROM USER_APP_DATA WHERE USER_ID = $1 FOR UPDATE`,
            [userId]
        )
        const data = normalizeData(result.rows[0]?.data)
        const needsSync = !result.rows[0]?.relational_synced_at ||
            new Date(result.rows[0].updated_at) > new Date(result.rows[0].relational_synced_at)
        if (needsSync) {
            await replaceMappedRecords(client, userId, data)
            await client.query(
                "UPDATE USER_APP_DATA SET RELATIONAL_SYNCED_AT = NOW() WHERE USER_ID = $1",
                [userId]
            )
        }
        await client.query("COMMIT")
        res.status(200).json({data})
    } catch (err) {
        if (client) {
            try {
                await client.query("ROLLBACK")
            } catch (rollbackError) {
                console.error("Falha ao desfazer sincronização relacional:", rollbackError)
            }
        }
        console.error("Falha ao carregar dados do usuário:", err)
        res.status(500).json({response: "Erro no servidor"})
    } finally {
        client?.release()
    }
}

export async function ReplaceUserData(req, res) {
    const data = req.body?.data
    if (!validData(data)) {
        return res.status(400).json({response: "Formato dos dados inválido"})
    }

    let client
    try {
        client = await pool.connect()
        await client.query("BEGIN")
        const userId = String(req.user.id)
        await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [userId])
        const normalized = normalizeData(data)
        await replaceMappedRecords(client, userId, normalized)
        const result = await client.query(`
            INSERT INTO USER_APP_DATA (USER_ID, DATA, UPDATED_AT, RELATIONAL_SYNCED_AT)
            VALUES ($1, $2::jsonb, NOW(), NOW())
            ON CONFLICT (USER_ID)
            DO UPDATE SET DATA = EXCLUDED.DATA,
                          UPDATED_AT = NOW(),
                          RELATIONAL_SYNCED_AT = NOW()
            RETURNING DATA
        `, [userId, JSON.stringify(normalized)])
        await client.query("COMMIT")
        res.status(200).json({data: result.rows[0].data})
    } catch (err) {
        if (client) {
            try {
                await client.query("ROLLBACK")
            } catch (rollbackError) {
                console.error("Falha ao desfazer gravação de dados:", rollbackError)
            }
        }
        console.error("Falha ao salvar dados do usuário:", err)
        res.status(500).json({response: "Erro no servidor"})
    } finally {
        client?.release()
    }
}

export async function ImportUserData(req, res) {
    const incoming = req.body?.data
    if (!validData(incoming)) {
        return res.status(400).json({response: "Formato dos dados inválido"})
    }

    let client
    try {
        client = await pool.connect()
        await client.query("BEGIN")
        const userId = String(req.user.id)
        await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [userId])
        const current = await client.query(
            "SELECT DATA FROM USER_APP_DATA WHERE USER_ID = $1 FOR UPDATE",
            [userId]
        )
        const merged = mergeData(current.rows[0]?.data, incoming)
        await replaceMappedRecords(client, userId, merged)
        await client.query(`
            INSERT INTO USER_APP_DATA (USER_ID, DATA, UPDATED_AT, RELATIONAL_SYNCED_AT)
            VALUES ($1, $2::jsonb, NOW(), NOW())
            ON CONFLICT (USER_ID)
            DO UPDATE SET DATA = EXCLUDED.DATA,
                          UPDATED_AT = NOW(),
                          RELATIONAL_SYNCED_AT = NOW()
        `, [userId, JSON.stringify(merged)])
        await client.query("COMMIT")
        res.status(200).json({data: merged})
    } catch (err) {
        if (client) {
            try {
                await client.query("ROLLBACK")
            } catch (rollbackError) {
                console.error("Falha ao desfazer importação:", rollbackError)
            }
        }
        console.error("Falha ao importar dados locais:", err)
        res.status(500).json({response: "Erro ao importar os dados locais"})
    } finally {
        client?.release()
    }
}
