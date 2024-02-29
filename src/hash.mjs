const { subtle } = globalThis.crypto;
export const hash = async (algorithm, ab)=>
    new Uint8Array(await subtle.digest(algorithm, await ab)).reduce(
        (memo, i) => memo + i.toString(16).padStart(2, '0'),
        '',
    );