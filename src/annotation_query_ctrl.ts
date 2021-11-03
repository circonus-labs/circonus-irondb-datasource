export class AnnotationQueryEditor {
    static templateUrl = 'partials/annotation.editor.html';

    annotation: any;

    constructor() {
        this.annotation.alertId = this.annotation.alertId || '';
        this.annotation.annotationQueryText = this.annotation.annotationQueryText || '';
        this.annotation.annotationQueryType = this.annotation.annotationQueryType || 'alerts';
        this.annotation.annotationFilterApply = this.annotation.annotationFilterApply || 'all';
        this.annotation.annotationFilterText = this.annotation.annotationFilterText || '';
    }

    annotationQueryTypeOptions = [{ value: 'alerts', text: 'Alerts' }];

    annotationFilterApplyOptions = [
        { value: 'all', text: 'ALL' },
        { value: 'any', text: 'ANY' },
    ];
}
