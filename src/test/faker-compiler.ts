import {FakerCompiler} from "../FakerCompiler"

async function main() {
    const fakerCompiler = new FakerCompiler()

    const s = "Some big string {{faker.address.city()}} and more more text here"
    let r = fakerCompiler.compileTemplate(s)
    console.log(r)

    let o: any = {
        first_name: "{{faker.name.firstName()}}",
        last_name: "{{faker.name.lastName()}}",
        address: {
            city: "{{faker.address.city()}}",
            streetAddress: "{{faker.address.streetAddress()}}"
        },
        phone: "{{faker.phone.phoneNumber()}}"
    }

    o = {
        name: "{{faker.company.companyName()}}",
        city: "{{faker.address.city()}}",
        timezone: "EE",
        address: "{{faker.address.streetAddress()}}",
        phone: "{{faker.phone.phoneNumber()}}",
        contact_name: "{{faker.name.firstName()}} {{faker.name.lastName()}}",
        contact_position: "{{faker.name.jobTitle()}}",
        contact_email: "{{faker.internet.email()}}",
        contact_phone: "555-555-555",
        client_id: "{{faker.lorem.word()}}",
        privacy_policy_url: "{{faker.internet.url()}}"
    }

    console.log(o)

    o = fakerCompiler.compileObject(o)

    console.log(o)
}

main()
