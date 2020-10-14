import {FlowRequest, HttpResponse} from "./interfaces"
import * as request from "request"
import {CoreOptions} from "request"
import {ParamsStorage} from "./ParamsStorage"
const colors = require("colors/safe")
const jsonpath = require("jsonpath")

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

        console.log(colors.yellow(s))

        if (req.log) {
            console.log(response.body)
        }

        if (response.body.errors) {
            // console.log(response.body.errors)
        }

        if (req.expected) {
            const expected = req.expected

            if (expected.statusCode && expected.statusCode !== response.statusCode) {
                if (response.body.errors) {
                    console.log(response.body.errors)
                }
                throw new Error(
                    `Expected status code ${expected.statusCode} but got ${response.statusCode}`
                )
            }

            Sender.containAllProperties(expected.body, response.body)
        }

        if (req.save) {
            this.saveParamsToStorage(req.save, response.body)
        }

        return response
    }

    private saveParamsToStorage(paramsToSave, responseBody) {
        // console.log("@@@@@@")
        // console.log(paramsToSave)
        // console.log(responseBody)
        // console.log("@@@@@@")
        let data = responseBody || null

        // console.log("===========")
        // console.log(paramsToSave)
        // console.log("===========")

        for (const param_name in paramsToSave) {
            const jp_string = paramsToSave[param_name]
            let r: any[] = jsonpath.query(responseBody, jp_string)
            if (r.length === 0) {
                throw new Error(
                    `Please check jsonpath parameter (${jp_string}) it has no matches in the body`
                )
            }

            if (r.length !== 1) {
                throw new Error(
                    `Please check jsonpath parameter (${jp_string}) it has more than one matches in the body`
                )
            }

            this.storage.setParam(param_name, r[0])
        }

        console.log("\n")
        this.storage.logParams()
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
