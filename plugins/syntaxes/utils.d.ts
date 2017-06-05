export interface ParameterInformation {
	label: string;
	documentation?: string;
}

export interface SignatureInformation {
	label: string;
	documentation?: string;
	parameters: ParameterInformation[];
}

export interface SignatureHelp {
	signatures: SignatureInformation[];
	activeSignature: number;
	activeParameter: number;
}