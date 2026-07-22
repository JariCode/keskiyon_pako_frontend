export default class PlayerStats {
  constructor() {
    this.maxHP = 100;
    this.hp = 100;

    this.maxEnergy = 100;
    this.energy = 100;
    this.energyRegenRate = 8;
    this.energyRegenDelay = 1500;
    this.lastEnergyUseTime = 0;

    this.sprintCost = 15;
    this.attackCost = 8;

    this.level = 1;
    this.zombiesKilled = 0;
    this.killsPerLevel = 5;

    this.inventory = [];
  }

  // Lataa tallennetusta pelistä (backendin muoto)
  loadFromSave(save) {
    if (!save) return;

    this.zombiesKilled = save.zombiesKilled ?? 0;
    this.level = save.level ?? (Math.floor(this.zombiesKilled / this.killsPerLevel) + 1);
    this.maxHP = save.maxHP ?? (100 + (this.level - 1) * 10);
    this.hp = Math.min(save.hp ?? this.maxHP, this.maxHP);
    this.inventory = Array.isArray(save.inventory) ? [...save.inventory] : [];

    // Energia palautuu aina täyteen latauksessa
    this.energy = this.maxEnergy;
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    return this.hp;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHP, this.hp + amount);
    return this.hp;
  }

  isDead() {
    return this.hp <= 0;
  }

  canSprint() {
    return this.energy > 0;
  }

  canAttack() {
    return this.energy >= this.attackCost;
  }

  useSprintEnergy(deltaSeconds, now) {
    this.energy = Math.max(0, this.energy - this.sprintCost * deltaSeconds);
    this.lastEnergyUseTime = now;
  }

  useAttackEnergy(now) {
    this.energy = Math.max(0, this.energy - this.attackCost);
    this.lastEnergyUseTime = now;
  }

  regenEnergy(deltaSeconds, now) {
    if (now - this.lastEnergyUseTime > this.energyRegenDelay) {
      this.energy = Math.min(this.maxEnergy, this.energy + this.energyRegenRate * deltaSeconds);
    }
  }

  registerKill() {
    this.zombiesKilled += 1;
    const leveledUp = this.zombiesKilled % this.killsPerLevel === 0;
    if (leveledUp) {
      this.level += 1;
      this.maxHP += 10;
      this.hp = this.maxHP;
    }
    return leveledUp;
  }

  addItem(itemId) {
    if (!this.inventory.includes(itemId)) {
      this.inventory.push(itemId);
    }
  }

  removeItem(itemId) {
    this.inventory = this.inventory.filter((id) => id !== itemId);
  }

  hasItem(itemId) {
    return this.inventory.includes(itemId);
  }

  getSnapshot() {
    return {
      hp: Math.round(this.hp),
      maxHP: this.maxHP,
      energy: Math.round(this.energy),
      maxEnergy: this.maxEnergy,
      level: this.level,
      zombiesKilled: this.zombiesKilled,
      inventory: [...this.inventory],
    };
  }

  // Tallennusta varten (backendin odottama muoto)
  getSaveData(currentArea, progress = {}) {
    return {
      hp: Math.round(this.hp),
      maxHP: this.maxHP,
      level: this.level,
      currentArea,
      inventory: [...this.inventory],
      zombiesKilled: this.zombiesKilled,
      progress,
    };
  }
}