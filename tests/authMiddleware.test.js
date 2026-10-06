import test from "node:test"
import assert from "node:assert/strict"
import jwt from "jsonwebtoken"
import { verifyToken } from "../midlewares/authMiddleware.js"

const previousSecret = process.env.SECRET
const previousUrlFront = process.env.URLFRONT
process.env.SECRET = "test-secret-that-is-at-least-32-characters-long"
process.env.URLFRONT = "https://frontend.example"

function runMiddleware({method = "GET", authorization, cookie, origin} = {}) {
    const req = {
        method,
        cookies: cookie ? {token: cookie} : {},
        header: name => name === "Authorization" ? authorization : undefined,
        get: name => name === "Origin" ? origin : undefined
    }
    const result = {status: null, body: null, nextCalled: false}
    const res = {
        status(status) {
            result.status = status
            return this
        },
        json(body) {
            result.body = body
            return this
        }
    }

    verifyToken(req, res, () => {
        result.nextCalled = true
    })
    return {req, result}
}

test("rejects requests without a token", () => {
    const {result} = runMiddleware()
    assert.equal(result.status, 401)
    assert.equal(result.nextCalled, false)
})

test("rejects cookie-authenticated mutations from an untrusted origin", () => {
    const token = jwt.sign({id: 7}, process.env.SECRET)
    const {result} = runMiddleware({method: "POST", cookie: token, origin: "https://evil.example"})
    assert.equal(result.status, 403)
    assert.equal(result.nextCalled, false)
})

test("accepts cookie-authenticated mutations from the configured frontend", () => {
    const token = jwt.sign({id: 7}, process.env.SECRET)
    const {req, result} = runMiddleware({
        method: "POST",
        cookie: token,
        origin: "https://frontend.example"
    })
    assert.equal(result.nextCalled, true)
    assert.equal(req.user.id, 7)
})

test("accepts a valid bearer token for an authenticated request", () => {
    const token = jwt.sign({id: 7}, process.env.SECRET)
    const {req, result} = runMiddleware({method: "POST", authorization: `Bearer ${token}`})
    assert.equal(result.nextCalled, true)
    assert.equal(req.user.id, 7)
})

test("rejects tokens signed with an unsupported algorithm", () => {
    const token = jwt.sign({id: 7}, process.env.SECRET, {algorithm: "HS384"})
    const {result} = runMiddleware({authorization: `Bearer ${token}`})
    assert.equal(result.status, 401)
    assert.equal(result.nextCalled, false)
})

test.after(() => {
    if (previousSecret === undefined) delete process.env.SECRET
    else process.env.SECRET = previousSecret
    if (previousUrlFront === undefined) delete process.env.URLFRONT
    else process.env.URLFRONT = previousUrlFront
})
