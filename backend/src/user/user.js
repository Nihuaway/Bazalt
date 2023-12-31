export class User {
    constructor(name, email, enteredAt, createdAt, activated, tag) {
        this._id = null
        this.name = name
        this.email = email
        this.createdAt = createdAt
        this.enteredAt = enteredAt
        this.activated = activated
        this.tag = tag
    }
}

export const userConverter = {
    toFirestore: user => {
        return {
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            enteredAt: user.enteredAt,
            activated: user.activated,
            tag: user.tag,
        }
    },
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options)
        const exit = new User(
            data.name,
            data.email,
            data.createdAt,
            data.enteredAt,
            data.activated,
            data.tag
        )
        return { ...exit, _id: snapshot.id }
    },
}
