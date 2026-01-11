import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

interface ApiError {
	error: {
		code: string;
		message: string;
		details?: { message: string }[];
	};
}

export function parseBackendError(res: unknown): string {
	const data = res as ApiError;
	const err = data?.error;

	if (err?.code === "VALIDATION_ERROR") {
		return err.details?.[0]?.message ?? err.message;
	}

	return err?.message ?? "Unknown error";
}
