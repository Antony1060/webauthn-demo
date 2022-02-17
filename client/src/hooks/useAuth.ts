import { decode } from "jsonwebtoken";
import { useState } from "react";

export const useAuth = (): { authenticated: boolean, username: string } => {
    const token = localStorage.getItem("token") ?? "";

    const decoded = decode(token) ?? {};
    const username = typeof decoded === "object" ? decoded["username"] ?? "" : "";
    return { authenticated: !!token, username };
}