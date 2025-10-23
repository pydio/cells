export function createHeaders(isHttp: any, httpHeaders: any): Headers;
export function createResponseStatusError(status: any, url: any): MissingPDFException | UnexpectedResponseException;
export function extractFilenameFromHeader(responseHeaders: any): string | null;
export function validateRangeRequestCapabilities({ responseHeaders, isHttp, rangeChunkSize, disableRange, }: {
    responseHeaders: any;
    isHttp: any;
    rangeChunkSize: any;
    disableRange: any;
}): {
    allowRangeRequests: boolean;
    suggestedLength: undefined;
};
export function validateResponseStatus(status: any): boolean;
import { MissingPDFException } from "../shared/util.js";
import { UnexpectedResponseException } from "../shared/util.js";
