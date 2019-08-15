export const FILE_ACCESS_IDENTITY_ROUTES = {
    createFileAccessIdentity() {
        return `${process.env.LEARNING_OBJECT_API}/file-access-identity`;
    },
    updateFileAccessIdentity(username: string) {
        return `${process.env.LEARNING_OBJECT_API}/file-access-identity/${username}`;
    }
}