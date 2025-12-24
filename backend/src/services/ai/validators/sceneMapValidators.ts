import { SceneSegment, ValidationIssue } from '../../../types/ai';

export const validateSceneMapDuration = (segments: SceneSegment[], targetDuration: number): { status: 'ok'|'fail', issues: ValidationIssue[] } => {
    if (!segments || segments.length === 0) return { status: 'fail', issues: [{ type: 'fail', message: 'Scene map is empty' }] };

    const lastSegment = segments[segments.length - 1];
    
    // Allow 1 second tolerance
    if (Math.abs(lastSegment.endSec - targetDuration) > 1) {
        return {
            status: 'fail',
            issues: [{ 
                type: 'fail', 
                message: `Scene map duration mismatch. Ends at ${lastSegment.endSec}s, expected ${targetDuration}s.` 
            }]
        };
    }

    return { status: 'ok', issues: [] };
};
