import { sha256 } from "@noble/hashes/sha2";
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils";

export function hash(input: string): string {
    return bytesToHex(sha256(utf8ToBytes(input)));
}
