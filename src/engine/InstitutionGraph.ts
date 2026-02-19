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

    // Find the successor for a role if the current holder dies
    // This is a placeholder for the complex logic: "graph searches strongest influence"
    findSuccessor(_institutionId: ID, _roleName: string, _candidates: any[]): ID | null {
        // TODO: Implement influence search in SocialGraph
        return null;
    }

    assignRole(institutionId: ID, roleName: string, personId: ID) {
        const inst = this.institutions[institutionId];
        if (!inst) return;

        const role = inst.roles.find(r => r.name === roleName);
        if (role) {
            role.holderId = personId;
        }
    }

    getRoleHolder(institutionId: ID, roleName: string): ID | null {
        const inst = this.institutions[institutionId];
        if (!inst) return null;
        const role = inst.roles.find(r => r.name === roleName);
        return role ? role.holderId : null;
    }
}
