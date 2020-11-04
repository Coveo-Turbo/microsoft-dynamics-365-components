export class UUID {
    private uuid: string;

    constructor(uuid: string) {
        this.uuid = uuid.toLowerCase().replace(/-|{|}/g, "");
    }

    toString() {
        return this.uuid.replace(/(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})/, "$1-$2-$3-$4-$5");
    }

    equals(uuid: UUID): boolean {
        return this.toString() === uuid.toString();
    }
}
