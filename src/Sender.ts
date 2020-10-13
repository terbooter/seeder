import {FlowRequest, HttpResponse} from "./interfaces"
import * as request from "request"
import {CoreOptions} from "request"
import {ParamsStorage} from "./ParamsStorage"

export class Sender {
    constructor(private domain: string, private storage: ParamsStorage) {}

    public async send(req: FlowRequest) {
        req = this.storage.replaceParams(req)
        console.log(`--> ${req.url}`)

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

        if (req.log) {
            console.log(response.body)
        }

        if (response.body.errors) {
            console.log(response.body.errors)
        }

        if (req.expected) {
            const expected = req.expected

            Sender.containAllProperties(expected.body, response.body)
        }

        this.saveParamsToStorage(req, response)

        return response
    }

    private saveParamsToStorage(req: FlowRequest, response) {
        let paramsToSave = req.response
        let data = response.body.data || null

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

        console.log("===========")
        console.log(paramsToSave)
        console.log("===========")

        if (paramsToSave && data) {
            for (let p in paramsToSave) {
                if (data[p]) {
                    this.storage.setParam(paramsToSave[p], data[p])
                }
            }
        }
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
