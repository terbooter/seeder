import {PathLike} from "fs"

export interface IDisk {
    getFiles(): Promise<string[]>

    read(file: PathLike): Promise<string>
}

export interface FlowRequest {
    url: string
    method?
    body?
    headers?
    response?
    log?: boolean
    expected?: {
        statusCode?: number
        body?
    }
}
