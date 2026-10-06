import test from "node:test"
import assert from "node:assert/strict"
import {mergeData, normalizeData, validData} from "../controllers/UserData.js"

test("normalizes absent collections to empty arrays", () => {
    assert.deepEqual(normalizeData({habits: [{id: "habit-1"}]}), {
        transactions: [],
        customTransactionTypes: [],
        habits: [{id: "habit-1"}],
        notes: [],
        events: [],
        workouts: []
    })
})

test("merges imported records idempotently and preserves habit check history", () => {
    const previous = {
        habits: [{id: "habit-1", name: "Read", checks: {"2026-10-01": true}}],
        notes: [{id: "note-1", title: "Existing"}]
    }
    const imported = {
        habits: [{id: "habit-1", name: "Read more", checks: {"2026-10-02": true}}],
        notes: [{id: "note-2", title: "Imported"}]
    }

    const once = mergeData(previous, imported)
    const twice = mergeData(once, imported)

    assert.deepEqual(twice, once)
    assert.equal(twice.habits.length, 1)
    assert.deepEqual(twice.habits[0].checks, {
        "2026-10-01": true,
        "2026-10-02": true
    })
    assert.deepEqual(twice.notes.map(note => note.id), ["note-1", "note-2"])
})

test("merges nested workout exercises and session records", () => {
    const merged = mergeData({
        workouts: [{
            id: "workout-1",
            sessions: {"2026-10-01": 1},
            exercises: [{id: "exercise-1", name: "Squat"}]
        }]
    }, {
        workouts: [{
            id: "workout-1",
            sessions: {"2026-10-02": 1},
            exercises: [{id: "exercise-2", name: "Press"}]
        }]
    })

    assert.deepEqual(merged.workouts[0].sessions, {
        "2026-10-01": 1,
        "2026-10-02": 1
    })
    assert.deepEqual(
        merged.workouts[0].exercises.map(exercise => exercise.id),
        ["exercise-1", "exercise-2"]
    )
})

test("rejects malformed data collection shapes", () => {
    assert.equal(validData({transactions: [], habits: []}), true)
    assert.equal(validData({transactions: {}}), false)
    assert.equal(validData([]), false)
})
