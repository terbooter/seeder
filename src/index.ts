import {Disk} from "./Disk"
import * as path from "path"
import * as fs from "fs"
import {Sender} from "./Sender"
import {ParamsStorage} from "./ParamsStorage"
import {FakerCompiler} from "./FakerCompiler"
import {FlowRequest} from "./interfaces"

async function main() {
    let arr = await getFlowArray()

    const storage = new ParamsStorage()
    const apiDomain = getAPIDomain()
    console.log(`  API Domain: ${apiDomain}`)
    const sender = new Sender(apiDomain, storage)
    const fakerCompiler = new FakerCompiler()

    /*if (r.statusCode === 502) {
        throw new Error("API response 502");
    }*/

    arr = setDefaultParams(arr)

    for (let req of arr) {
        req = fakerCompiler.compileObject(req)
        let r = await sender.send(req)
    }
}

function getAPIDomain(): string {
    if (process.argv[3]) {
        return process.argv[3]
    }

    throw new Error(`Missing required domain argument`)
}

function getFolder(): string {
    if (process.argv[2]) {
        return process.argv[2]
    }

    throw new Error(`Missing required folder argument`)
}

async function getFlowArray(): Promise<FlowRequest[]> {
    const seedsDir = path.resolve(__dirname, getFolder())
    const disk = new Disk(seedsDir)
    let files = await disk.getFiles()
    console.log(files)
    let arr: any[] = []
    for (let file of files) {
        const data = JSON.parse(fs.readFileSync(file).toString())
        arr = arr.concat(data)
    }

    arr = repeat(arr)

    return arr
}

function setDefaultParams(arr: FlowRequest[]): FlowRequest[] {
    return arr.map((item: FlowRequest) => {
        if (!item.expected) {
            item.expected = {
                statusCode: 200
            }
        }
        return item
    })
}

function repeat(arr) {
    let newArr: any[] = []
    for (let item of arr) {
        let repeat = 1
        if (item.repeat) {
            repeat = parseInt(item.repeat)
        }

        for (let i = 0; i < repeat; i++) {
            newArr.push(item)
        }
    }

    return newArr
}

main()
