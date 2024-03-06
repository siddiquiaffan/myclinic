
export function authorizeRequest(req: Request) {
    const additionalLinksuthorization = req.headers.get('Authorization');
    const token = additionalLinksuthorization?.split(' ')[1]?.trim();

    if (!token) {
        return new Response('Unauthorized', { status: 401 })
    }

    if (token !== process.env.API_KEY) {
        return new Response('Forbidden', { status: 403 })
    }

    return null
}