export class ParamsStorage {
    private params = {}

    constructor() {}

    public setParam(name: string, value) {
        this.params[name] = value
    }

    public compileTemplateString(template: string): string {
        for (let key in this.params) {
            let regex = new RegExp(`{{${key}}}`, "g")
            template = template.replace(regex, this.params[key])
        }

        return template
    }

    public replaceParams(object: any): any {
        let str = JSON.stringify(object)
        str = this.compileTemplateString(str)
        return JSON.parse(str)
    }
}
