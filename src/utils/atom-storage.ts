import { atom } from "jotai";

export function atomWithLocalStorage<T>(key: string, initialValue: T) {
    return atomWithBetterStorage(
        key,
        initialValue,
        (key, value) => localStorage.setItem(key, value),
        (key) => localStorage.getItem(key)
    );
}

export function atomWithSessionStorage<T>(key: string, initialValue: T) {
    return atomWithBetterStorage(
        key,
        initialValue,
        (key, value) => sessionStorage.setItem(key, value),
        (key) => sessionStorage.getItem(key)
    );
}

function atomWithBetterStorage<T>(
    key: string,
    initialValue: T,
    storageAction: (key: string, value: string) => void,
    retrievalAction: (key: string) => string | null
) {
    // Read synchronously from storage at atom creation
    let value: T = initialValue;
    try {
        const storedValue = retrievalAction(key);
        if (storedValue !== null) {
            value = JSON.parse(storedValue);
        }
    } catch (e) {
        console.warn(`Failed to parse localStorage for key "${key}"`, e);
    }

    const baseAtom = atom<T>(value);

    // A writable atom that updates storage on write
    const derivedAtom = atom(
        (get) => get(baseAtom),
        (get, set, newValue: T) => {
            set(baseAtom, newValue);
            try {
                storageAction(key, JSON.stringify(newValue));
            } catch (e) {
                console.warn(
                    `Failed to write to localStorage for key "${key}"`,
                    e
                );
            }
        }
    );

    return derivedAtom;
}
