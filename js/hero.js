// hero.js - Hero class with animation, stats, and XP management
export class Hero {
  constructor(name, sprites) {
    this.name = name;
    this.maxHp = 100;
    this.hp = 100;
    this.atk = 15;
    this.xp = 0;
    this.level = 1;
    this.attackGauge = 100; // New: Attack gauge
    this.defenseGauge = 100; // New: Defense gauge
    this.state = 'idle';
    this.sprites = sprites;
  }

  setState(state) {
    this.state = state;
    this.updateSprite();
  }

  updateSprite() {
    const heroSprite = document.getElementById('heroSprite');
    const heroSpriteHome = document.getElementById('heroSpriteHome');
    const heroBattleSprite = document.getElementById('heroBattleSprite');
    const creatureImage = document.getElementById('creatureImage');
    
    // Remove all animation classes
    const sprites = [heroSprite, heroSpriteHome, heroBattleSprite, creatureImage].filter(el => el);
    sprites.forEach(sprite => {
      sprite.classList.remove('attacking', 'hurt', 'celebrating');
    });
    
    // Set the correct sprite sheet
    if (heroSprite && this.sprites[this.state]) {
      heroSprite.src = this.sprites[this.state];
    }
    if (heroSpriteHome && this.sprites[this.state]) {
      heroSpriteHome.src = this.sprites[this.state];
    }
    if (heroBattleSprite && this.sprites[this.state]) {
      heroBattleSprite.src = this.sprites[this.state];
    }
    if (creatureImage && this.sprites[this.state]) {
      creatureImage.src = this.sprites[this.state];
    }
    
    // Add animation class based on state
    if (this.state === 'attack') {
      sprites.forEach(sprite => sprite.classList.add('attacking'));
    } else if (this.state === 'hurt') {
      sprites.forEach(sprite => sprite.classList.add('hurt'));
    } else if (this.state === 'celebrate') {
      sprites.forEach(sprite => sprite.classList.add('celebrating'));
    }
    // idle state uses default animation from CSS
  }

  gainXP(amount) {
    this.xp += amount;
    
    // Reworked XP gain to handle carry-over XP and new level-up logic
    let leveledUp = false;
    while (this.xp >= this.xpNeededForNextLevel()) {
      leveledUp = true;
      const xpNeeded = this.xpNeededForNextLevel();
      this.level++;
      this.xp -= xpNeeded; // Carry over excess XP
      this.maxHp += 20;
      this.hp = this.maxHp; // Full heal on level up
      this.atk += 5;
    }
    return leveledUp; // Level up occurred
  }
    return false;
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    this.setState('hurt');
    setTimeout(() => {
      if (this.hp > 0) {
        this.setState('idle');
      }
    }, 500);
  }

  attack() {
    this.setState('attack');
    setTimeout(() => {
      this.setState('idle');
    }, 600);
    return this.atk;
  }

  celebrate() {
    this.setState('celebrate');
    setTimeout(() => {
      this.setState('idle');
    }, 1000);
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  xpNeededForNextLevel() {
    // New XP scale: 100 * current level
    return this.level * 100;
  }

  // Removed reset() to maintain post-battle HP/Gauges.
  // HP recovery must be done explicitly via items/actions.
}

