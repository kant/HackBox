
export function onSuccess(resp, data) {
    resp.response({payload: data}).code(200);
}
