export const FILE_ACCESS_IDENTITY_ROUTES = {
    createFileAccessIdentity(username: string) {
        return `${process.env.LEARNING_OBJECT_API}/users/${
            encodeURIComponent(username)
        }/file-access-identity`;
    },
    updateFileAccessIdentity(username: string) {
        return `${process.env.LEARNING_OBJECT_API}/users/${username}/file-access-identity`;
    }
};

export const LEARNING_OBJECT_ROUTE = {
    getCollection() {
        return `${process.env.LEARNING_OBJECT_API}/collections`
    }
}