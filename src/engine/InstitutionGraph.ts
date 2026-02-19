import type { ID, Institution } from './types.js';

export class InstitutionGraph {
    private institutions: Record<ID, Institution>;

    constructor(initialInstitutions: Record<ID, Institution> = {}) {
        this.institutions = initialInstitutions;
    }

    addInstitution(inst: Institution) {
        this.institutions[inst.id] = inst;
    }

    getInstitution(id: ID): Institution | undefined {
        return this.institutions[id];
    }

    getAllInstitutions(): Institution[] {
        return Object.values(this.institutions);
    }

    // Simplified: Just set the leader
    assignLeader(institutionId: ID, personId: ID) {
        const inst = this.institutions[institutionId];
        if (!inst) return;
        inst.leaderId = personId;
    }

    getLeader(institutionId: ID): ID | undefined {
        return this.institutions[institutionId]?.leaderId;
    }

    addMember(institutionId: ID, personId: ID) {
        const inst = this.institutions[institutionId];
        if (inst && !inst.members.includes(personId)) {
            inst.members.push(personId);
        }
    }
}
