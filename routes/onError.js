// onError
export function onError(res, message, err) {
    console.error("Error: ", message, err);
    res.response().code(500);
}
