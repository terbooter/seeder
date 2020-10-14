import {FlowRequest, HttpResponse} from "./interfaces"
import * as request from "request"
import {CoreOptions} from "request"
import {ParamsStorage} from "./ParamsStorage"
const colors = require("colors/safe")

export class Sender {
    constructor(private domain: string, private storage: ParamsStorage) {}

    public async send(req: FlowRequest) {
        req = this.storage.replaceParams(req)

        process.stdout.write(`--> ${req.url}`)

        const method = req.method || "post"

        const url = `${this.domain}${req.url}`
        let options: CoreOptions = {
            method: method,
            headers: {
                "Content-Type": "application/json",
                ...req.headers
            },
            body: req.body,
            json: true
        }

        let response: HttpResponse = await this.httpRequest(url, options)

        const s = `  ${response.statusCode}`
        process.stdout.write(colors.yellow(s))
        process.stdout.write(`\n`)

        if (req.log) {
            console.log(response.body)
        }

        if (response.body.errors) {
            // console.log(response.body.errors)
        }

        if (req.expected) {
            const expected = req.expected

            if (expected.statusCode && expected.statusCode !== response.statusCode) {
                throw new Error(
                    `Expected status code ${expected.statusCode} but got ${response.statusCode}`
                )
            }

            Sender.containAllProperties(expected.body, response.body)
        }

        if (req.store) {
            this.saveParamsToStorage(req.store, response.body)
        }

        return response
    }

    private saveParamsToStorage(paramsToSave, responseBody) {
        // console.log("@@@@@@")
        // console.log(paramsToSave)
        // console.log(responseBody)
        // console.log("@@@@@@")
        let data = responseBody || null

        // Used to get first element of list
        // Sometimes we want to get id of item (user for example)
        // So we can provide filter by email, but API will return list of users containing one user
        // This is workaround to get first item of array
        if (Array.isArray(paramsToSave)) {
            paramsToSave = paramsToSave[0]
        }

        if (Array.isArray(data)) {
            data = data[0]
        }

        // console.log("===========")
        // console.log(paramsToSave)
        // console.log("===========")

        if (paramsToSave && data) {
            for (let p in paramsToSave) {
                if (data[p]) {
                    this.storage.setParam(paramsToSave[p], data[p])
                }
            }
        }

        // this.storage.logParams()
    }

    private async httpRequest(uri, options: CoreOptions): Promise<HttpResponse> {
        return new Promise<HttpResponse>((resolve, reject) => {
            request(uri, options, (error, httpResponse, body) => {
                if (error) {
                    reject(error)
                    return
                }

                let statusCode = httpResponse.statusCode
                resolve({statusCode: statusCode, body: body})
            })
        })
    }

    private static containAllProperties(small, big, level = ""): void {
        for (let key in small) {
            if (typeof small[key] === "object") {
                level += `${level}.${key}`
                Sender.containAllProperties(small[key], big[key], level)
            } else {
                if (small[key] != big[key]) {
                    throw new Error(
                        `Expected param ${level}.${key}=${small[key]} But got: ${big[key]}`
                    )
                }
            }
        }
    }
}
