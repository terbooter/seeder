const jsonpath = require("jsonpath")

const body = {
    success: true,
    data: {
        calendar_id: 38,
        owner_user_id: 1,
        name: "Test Calendar of User 1",
        description: " Cal description",
        created_at: "2020-10-14T07:38:16.566Z",
        json_data: null
    }
}

const calendar_id = jsonpath.query(body, "$.data.calendar_id")[0]

console.log(calendar_id)

const o = {
    store: {
        book: [
            {
                category: "reference",
                author: "Nigel Rees",
                title: "Sayings of the Century",
                price: 8.95
            },
            {
                category: "fiction",
                author: "Evelyn Waugh",
                title: "Sword of Honour",
                price: 12.99
            },
            {
                category: "fiction",
                author: "Herman Melville",
                title: "Moby Dick",
                isbn: "0-553-21311-3",
                price: 8.99
            },
            {
                category: "fiction",
                author: "J. R. R. Tolkien",
                title: "The Lord of the Rings",
                isbn: "0-395-19395-8",
                price: 22.99
            }
        ],
        bicycle: {
            color: "red",
            price: 19.95
        }
    }
}

const r = jsonpath.query(o, "$..book[2]")

console.log(r)