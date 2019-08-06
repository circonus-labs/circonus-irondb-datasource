export declare enum SegmentType {
    MetricName = 0,
    TagCat = 1,
    TagVal = 2,
    TagPair = 3,
    TagSep = 4,
    TagEnd = 5,
    TagOp = 6,
    TagPlus = 7,
}
export declare function taglessName(name: string): string;
export declare function metaInterpolateLabel(fmt: string, meta_in: any[], idx: number): string;
export declare function encodeTag(type: SegmentType, tag: string, exactMatch?: boolean): string;
export declare function decodeTag(tag: string): string;
export declare function decodeNameAndTags(name: string): string;
export default class IrondbQuery {
    datasource: any;
    target: any;
    segments: any[];
    error: any;
    checkOtherSegmentsIndex: number;
    templateSrv: any;
    scopedVars: any;
    /** @ngInject */
    constructor(datasource: any, target: any, templateSrv?: any, scopedVars?: any);
    parseTarget(): void;
    getSegmentPathUpTo(index: any): any;
    parseTargetRecursive(astNode: any, func: any): any;
    updateSegmentValue(segment: any, index: any): void;
    addSelectMetricSegment(): void;
    updateModelTarget(targets: any): void;
    updateRenderedTarget(target: any, targets: any): void;
}
