import * as fs from "fs"
import {PathLike} from "fs"
import {IDisk} from "./interfaces"
import * as path from "path"

export class Disk implements IDisk {
    constructor(private dir: PathLike) {}

    public getDir(): PathLike {
        return this.dir
    }

    public async getFiles(): Promise<string[]> {
        let dir = this.dir

        return new Promise<string[]>((resolve, reject) => {
            fs.readdir(dir, (err, files) => {
                if (err) {
                    reject(err)
                    return
                }
                files.sort(this.sortFunction)
                let arr: string[] = []
                for (let file of files) {
                    arr.push(path.resolve(this.dir.toString(), file))
                }
                resolve(arr)
            })
        })
    }

    public async read(file: PathLike): Promise<string> {
        let path = this.dir + "/" + file

        return new Promise<string>((resolve, reject) => {
            fs.readFile(path, (err, data: Buffer) => {
                if (err) {
                    reject(err)
                    return
                }

                resolve(data.toString())
            })
        })
    }

    private sortFunction(a, b) {
        // take index prefix from file
        // Sample: 12__file_name.json  index=12

        let a1 = parseInt(a.split("__")[0])
        let b1 = parseInt(b.split("__")[0])
        if (a1 > b1) {
            return 1
        }
        if (a1 < b1) {
            return -1
        }
        return 0
    }
}
