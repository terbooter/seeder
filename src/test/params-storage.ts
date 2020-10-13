import {ParamsStorage} from "../ParamsStorage"

const storage = new ParamsStorage()
storage.setParam("ttt", "My Test Value")
storage.setParam("name", "Bill")

let str =
    "Some very interesting {{ttt}} string because ttt is {{ttt}} and His {{name}} is just a {{name}}"

let s = storage.compileTemplateString(str)
console.log(s)
