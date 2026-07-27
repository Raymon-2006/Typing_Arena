/**
 * Fighter Engine - Core fighting logic using Canvas
 * Inspired by the stickman fighting game reference
 */

class FighterEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.fighters = [];
    this.particles = [];
    this.screenShake = { x: 0, y: 0, intensity: 0 };
    
    // Define stickman proportions
    this.PROPORTIONS = {
      headRadius: 20,
      bodyLength: 50,
      armLength: 35,
      legLength: 40,
      jointSize: 4
    };
    
    this.animate = this.animate.bind(this);
  }

  /**
   * Create a new fighter
   */
  createFighter(config) {
    const fighter = {
      id: config.id || 'player1',
      x: config.x || 200,
      y: config.y || 300,
      direction: config.direction || 1, // 1 = right, -1 = left
      state: 'idle', // idle, walk, punch, kick, hit, victory, defeat
      health: config.health || 100,
      maxHealth: config.maxHealth || 100,
      combo: 0,
      color: config.color || '#58a6ff',
      name: config.name || 'Player',
      department: config.department || 'computer',
      
      // Animation properties
      frame: 0,
      frameTimer: 0,
      animSpeed: 10,
      isAnimating: false,
      
      // Physics
      velocity: { x: 0, y: 0 },
      scale: config.scale || 1,
      
      // Timing
      lastAction: Date.now(),
      cooldown: 0,
      
      // Sprite sheet data (if using images)
      spriteSheet: null,
      spriteFrames: {
        idle: [0],
        walk: [0, 1, 2, 3],
        punch: [4, 5, 6],
        kick: [7, 8, 9],
        hit: [10, 11],
        victory: [12, 13]
      }
    };
    
    this.fighters.push(fighter);
    return fighter;
  }

  /**
   * Set fighter action based on typing
   */
  setAction(fighterId, action) {
    const fighter = this.fighters.find(f => f.id === fighterId);
    if (!fighter) return;
    
    // Prevent interrupting certain animations
    if (fighter.isAnimating && ['punch', 'kick'].includes(action)) {
      return;
    }
    
    fighter.state = action;
    fighter.frame = 0;
    fighter.frameTimer = 0;
    fighter.isAnimating = true;
    
    // Reset after animation completes
    if (['punch', 'kick', 'hit'].includes(action)) {
      setTimeout(() => {
        fighter.state = 'idle';
        fighter.isAnimating = false;
      }, 300);
    }
  }

  /**
   * Update all fighters
   */
  update() {
    for (const fighter of this.fighters) {
      this.updateFighter(fighter);
    }
    this.updateParticles();
    this.updateScreenShake();
  }

  /**
   * Update individual fighter
   */
  updateFighter(fighter) {
    // Animation frame update
    fighter.frameTimer++;
    const frames = this.getFramesForState(fighter.state);
    if (fighter.frameTimer >= fighter.animSpeed) {
      fighter.frameTimer = 0;
      fighter.frame = (fighter.frame + 1) % frames.length;
    }
    
    // Apply velocity
    fighter.x += fighter.velocity.x;
    fighter.y += fighter.velocity.y;
    
    // Boundary checks
    fighter.x = Math.max(20, Math.min(this.canvas.width - 20, fighter.x));
    fighter.y = Math.max(50, Math.min(this.canvas.height - 50, fighter.y));
  }

  /**
   * Get animation frames for current state
   */
  getFramesForState(state) {
    const frameMap = {
      idle: [0],
      walk: [0, 1, 2, 3],
      punch: [4, 5, 6],
      kick: [7, 8, 9],
      hit: [10, 11],
      victory: [12, 13],
      defeat: [14, 15]
    };
    return frameMap[state] || frameMap.idle;
  }

  /**
   * Draw stickman fighter on canvas
   */
  drawStickman(fighter) {
    const ctx = this.ctx;
    const { x, y, direction, state, color, scale } = fighter;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(direction * scale, scale);
    
    // Set color with glow effect
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Calculate positions based on animation state
    const animOffset = this.getAnimationOffsets(state, fighter.frame);
    
    // Draw shadow
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 70, 30, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 10;
    
    // ---- HEAD ----
    ctx.beginPath();
    ctx.arc(0, -50 + animOffset.headY, this.PROPORTIONS.headRadius * 0.8, 0, Math.PI * 2);
    ctx.stroke();
    
    // ---- BODY ----
    ctx.beginPath();
    ctx.moveTo(0, -30 + animOffset.bodyY);
    ctx.lineTo(0, 20 + animOffset.bodyY);
    ctx.stroke();
    
    // ---- LEFT ARM ----
    ctx.beginPath();
    ctx.moveTo(0, -20 + animOffset.bodyY);
    ctx.lineTo(-this.PROPORTIONS.armLength + animOffset.leftArmX, 0 + animOffset.leftArmY);
    ctx.stroke();
    
    // ---- RIGHT ARM (ATTACK ARM) ----
    ctx.beginPath();
    ctx.moveTo(0, -20 + animOffset.bodyY);
    const rightArmX = this.PROPORTIONS.armLength + animOffset.rightArmX;
    const rightArmY = animOffset.rightArmY;
    ctx.lineTo(rightArmX, rightArmY);
    ctx.stroke();
    
    // Fist glow on punch
    if (state === 'punch') {
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#ff6b35';
      ctx.beginPath();
      ctx.arc(rightArmX, rightArmY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 10;
    }
    
    // ---- LEFT LEG ----
    ctx.beginPath();
    ctx.moveTo(0, 20 + animOffset.bodyY);
    ctx.lineTo(-this.PROPORTIONS.legLength * 0.5 + animOffset.leftLegX, 50 + animOffset.leftLegY);
    ctx.stroke();
    
    // ---- RIGHT LEG ----
    ctx.beginPath();
    ctx.moveTo(0, 20 + animOffset.bodyY);
    ctx.lineTo(this.PROPORTIONS.legLength * 0.5 + animOffset.rightLegX, 50 + animOffset.rightLegY);
    ctx.stroke();
    
    ctx.restore();
  }

  /**
   * Get animation offsets based on state and frame
   */
  getAnimationOffsets(state, frame) {
    const offsets = {
      idle: {
        headY: 0, bodyY: 0,
        leftArmX: 0, leftArmY: 0,
        rightArmX: 0, rightArmY: 0,
        leftLegX: 0, leftLegY: 0,
        rightLegX: 0, rightLegY: 0
      },
      walk: {
        headY: Math.sin(frame * 0.5) * 2,
        bodyY: Math.sin(frame * 0.5) * 2,
        leftArmX: -Math.sin(frame * 0.8) * 8,
        leftArmY: Math.cos(frame * 0.8) * 5,
        rightArmX: Math.sin(frame * 0.8) * 8,
        rightArmY: -Math.cos(frame * 0.8) * 5,
        leftLegX: -Math.sin(frame * 0.8) * 10,
        leftLegY: Math.cos(frame * 0.8) * 5,
        rightLegX: Math.sin(frame * 0.8) * 10,
        rightLegY: -Math.cos(frame * 0.8) * 5
      },
      punch: {
        headY: 0, bodyY: 0,
        leftArmX: -5, leftArmY: 5,
        rightArmX: 50 + (1 - frame/3) * 20,
        rightArmY: -20 - (1 - frame/3) * 15,
        leftLegX: 0, leftLegY: 0,
        rightLegX: 0, rightLegY: 0
      },
      kick: {
        headY: 0, bodyY: 0,
        leftArmX: -10, leftArmY: -10,
        rightArmX: 10, rightArmY: -10,
        leftLegX: -5, leftLegY: 5,
        rightLegX: 40 + (1 - frame/3) * 20,
        rightLegY: 20 - (1 - frame/3) * 30
      },
      hit: {
        headY: -10 + frame * 5,
        bodyY: -5 + frame * 3,
        leftArmX: -10 - frame * 3,
        leftArmY: -5 - frame * 2,
        rightArmX: -10 - frame * 3,
        rightArmY: -5 - frame * 2,
        leftLegX: 0, leftLegY: 0,
        rightLegX: 0, rightLegY: 0
      },
      victory: {
        headY: -5 + Math.sin(frame * 0.3) * 3,
        bodyY: 0,
        leftArmX: -35 - Math.sin(frame * 0.3) * 5,
        leftArmY: -20 - Math.cos(frame * 0.3) * 5,
        rightArmX: 35 + Math.sin(frame * 0.3) * 5,
        rightArmY: -20 - Math.cos(frame * 0.3) * 5,
        leftLegX: 0, leftLegY: 0,
        rightLegX: 0, rightLegY: 0
      }
    };
    
    return offsets[state] || offsets.idle;
  }

  /**
   * Create hit effect particles
   */
  createHitEffect(x, y, color = '#ff6b35') {
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15 - 5,
        life: 30 + Math.random() * 20,
        maxLife: 50,
        size: 3 + Math.random() * 5,
        color: color
      });
    }
    
    // Screen shake on hit
    this.screenShake.intensity = 8;
  }

  /**
   * Update particles
   */
  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      p.life--;
      p.size *= 0.98;
      
      if (p.life <= 0 || p.size < 0.5) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Update screen shake
   */
  updateScreenShake() {
    if (this.screenShake.intensity > 0) {
      this.screenShake.x = (Math.random() - 0.5) * this.screenShake.intensity * 2;
      this.screenShake.y = (Math.random() - 0.5) * this.screenShake.intensity * 2;
      this.screenShake.intensity *= 0.9;
      
      if (this.screenShake.intensity < 0.1) {
        this.screenShake.intensity = 0;
        this.screenShake.x = 0;
        this.screenShake.y = 0;
      }
    }
  }

  /**
   * Main render loop
   */
  render() {
    const ctx = this.ctx;
    const { canvas } = this;
    
    // Clear canvas with dark background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Apply screen shake
    ctx.save();
    ctx.translate(this.screenShake.x, this.screenShake.y);
    
    // Draw ground
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(0, canvas.height - 80, canvas.width, 2);
    
    // Draw grid lines (optional)
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    
    // Draw all fighters
    for (const fighter of this.fighters) {
      this.drawStickman(fighter);
    }
    
    // Draw particles
    for (const p of this.particles) {
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    
    ctx.restore();
  }

  /**
   * Animation loop
   */
  animate() {
    this.update();
    this.render();
    requestAnimationFrame(this.animate);
  }

  /**
   * Start the engine
   */
  start() {
    this.animate();
  }

  /**
   * Clean up
   */
  destroy() {
    this.fighters = [];
    this.particles = [];
  }
}

export default FighterEngine;