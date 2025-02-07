import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavComponent } from '../../shared/components/nav/nav.component';

interface Achievement {
  id: string;
  name: string;
  description: string;
  requirement: number;
  type: 'collection' | 'combo' | 'score';
  icon: string;
  unlocked: boolean;
  reward?: string;
}

interface Material {
  nom: string;
  points: string;
  collected: number;
  icon: string;
  color: string;
  comboMultiplier: number;
  lastCollected?: number;
  fact?: string;
  impact?: string;
}

interface Reward {
  level: number;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
  bonus: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, NavComponent],
  templateUrl: './home.component.html',
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes fade-in-up {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fade-in-down {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slide-up {
      from {
        opacity: 0;
        transform: translateY(40px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }

    @keyframes draw {
      to {
        stroke-dashoffset: 0;
      }
    }

    @keyframes bounce-slow {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-20px);
      }
    }

    .animate-draw {
      stroke-dasharray: 1000;
      stroke-dashoffset: 1000;
      animation: draw 2s ease-out forwards;
    }

    .animate-float {
      animation: float 3s ease-in-out infinite;
    }

    .animate-bounce-slow {
      animation: bounce-slow 4s ease-in-out infinite;
    }

    .animate-fade-in {
      animation: fade-in 1s ease-out;
    }

    .animate-fade-in-up {
      animation: fade-in-up 1s ease-out;
    }

    .animate-fade-in-down {
      animation: fade-in-down 1s ease-out;
    }

    .animate-slide-up {
      animation: slide-up 0.8s ease-out;
    }

    .animate-slide-up-delay {
      animation: slide-up 0.8s ease-out 0.2s both;
    }

    .animate-pulse-slow {
      animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    .animate-pulse-slower {
      animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    .animate-spin-slow {
      animation: spin 8s linear infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    /* Game-like animations */
    @keyframes pop {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px) rotate(-5deg); }
      75% { transform: translateX(5px) rotate(5deg); }
    }

    @keyframes glow {
      0%, 100% { 
        filter: drop-shadow(0 0 5px rgba(34, 197, 94, 0.5));
      }
      50% { 
        filter: drop-shadow(0 0 20px rgba(34, 197, 94, 0.8));
      }
    }

    @keyframes collect {
      0% { 
        transform: scale(1);
        opacity: 1;
      }
      50% { 
        transform: scale(1.5);
        opacity: 0.5;
      }
      100% { 
        transform: scale(0);
        opacity: 0;
      }
    }

    @keyframes float-around {
      0% { transform: translate(0, 0); }
      25% { transform: translate(10px, -10px); }
      50% { transform: translate(0, -20px); }
      75% { transform: translate(-10px, -10px); }
      100% { transform: translate(0, 0); }
    }

    .game-element {
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .game-element:hover {
      transform: scale(1.1);
      filter: brightness(1.2);
    }

    .game-element.active {
      animation: pop 0.5s ease;
    }

    .game-element.collected {
      animation: collect 0.5s ease forwards;
    }

    .game-element.shake {
      animation: shake 0.5s ease;
    }

    .game-element.glow {
      animation: glow 2s infinite;
    }

    .float-around {
      animation: float-around 6s ease-in-out infinite;
    }

    .interactive-area {
      position: relative;
      perspective: 1000px;
    }

    .rotate-3d {
      transition: transform 0.5s ease;
    }

    .rotate-3d:hover {
      transform: rotate3d(1, 1, 0, 15deg);
    }

    /* Particle effect styles */
    .particle {
      position: absolute;
      pointer-events: none;
      animation: particle-float 1s ease-out forwards;
      opacity: 0;
    }

    @keyframes particle-float {
      0% {
        transform: translateY(0) scale(1);
        opacity: 1;
      }
      100% {
        transform: translateY(-50px) scale(0);
        opacity: 0;
      }
    }

    /* Score animation */
    @keyframes score-pop {
      0% {
        transform: scale(0) translateY(0);
        opacity: 0;
      }
      50% {
        transform: scale(1.2) translateY(-20px);
        opacity: 1;
      }
      100% {
        transform: scale(1) translateY(-40px);
        opacity: 0;
      }
    }

    .score-popup {
      animation: score-pop 1s ease-out forwards;
      position: absolute;
      pointer-events: none;
    }

    /* Enhanced game animations */
    @keyframes mega-collect {
      0% { 
        transform: scale(1);
        filter: brightness(1);
      }
      50% { 
        transform: scale(2);
        filter: brightness(1.5);
      }
      100% { 
        transform: scale(0);
        filter: brightness(2);
      }
    }

    @keyframes achievement-unlock {
      0% {
        transform: translateY(50px);
        opacity: 0;
      }
      10% {
        transform: translateY(0);
        opacity: 1;
      }
      90% {
        transform: translateY(0);
        opacity: 1;
      }
      100% {
        transform: translateY(-50px);
        opacity: 0;
      }
    }

    @keyframes combo-pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.3); filter: brightness(1.2); }
      100% { transform: scale(1); }
    }

    .achievement-popup {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 1rem;
      border-radius: 8px;
      z-index: 1000;
      animation: achievement-unlock 3s ease-in-out forwards;
    }

    .mega-collect {
      animation: mega-collect 0.8s ease-out forwards;
    }

    .combo-active {
      animation: combo-pulse 0.5s ease infinite;
    }

    .power-up {
      position: absolute;
      padding: 0.5rem;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .power-up:hover {
      transform: scale(1.2);
      filter: brightness(1.2);
    }

    .level-progress {
      position: absolute;
      top: 10px;
      left: 10px;
      width: 200px;
      height: 20px;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 10px;
      overflow: hidden;
    }

    .level-bar {
      height: 100%;
      background: linear-gradient(90deg, #22c55e, #16a34a);
      transition: width 0.3s ease;
    }
  `]
})
export class HomeComponent implements OnInit {
  score = 0;
  level = 1;
  comboCount = 0;
  comboTimer: any;
  comboMultiplier = 1;
  powerUps: any[] = [];
  nextLevelScore = 100;
  currentFact = '';
  treesPlanted = 0;
  co2Saved = 0;
  waterSaved = 0;

  rewards: Reward[] = [
    {
      level: 2,
      name: 'Eco-Warrior',
      icon: '🌿',
      description: 'Points x1.5 pour le plastique',
      unlocked: false,
      bonus: 1.5
    },
    {
      level: 3,
      name: 'Master Recycleur',
      icon: '♻️',
      description: 'Combo durée +2s',
      unlocked: false,
      bonus: 2
    },
    {
      level: 5,
      name: 'Gardien de la Terre',
      icon: '🌍',
      description: 'Double points pour tout',
      unlocked: false,
      bonus: 2
    }
  ];

  achievements: Achievement[] = [
    {
      id: 'first_collect',
      name: 'Premier Pas Vert',
      description: 'Commencez votre voyage écologique',
      requirement: 1,
      type: 'collection',
      icon: '🌱',
      unlocked: false,
      reward: '+10 points bonus'
    },
    {
      id: 'combo_master',
      name: 'Eco Combo',
      description: 'Enchaînez 5 recyclages',
      requirement: 5,
      type: 'combo',
      icon: '⚡',
      unlocked: false,
      reward: 'Combo x2'
    },
    {
      id: 'score_100',
      name: 'Héros de la Planète',
      description: 'Sauvez 100kg de déchets',
      requirement: 100,
      type: 'score',
      icon: '🏆',
      unlocked: false,
      reward: 'Débloquez un badge spécial'
    }
  ];

  materiaux: Material[] = [
    { 
      nom: 'Plastique',
      points: '10',
      collected: 0,
      icon: '🥤',
      color: '#3B82F6',
      comboMultiplier: 1.2,
      fact: 'Une bouteille plastique met 450 ans à se dégrader',
      impact: 'Chaque kg recyclé = 1.5kg de CO2 évité'
    },
    { 
      nom: 'Verre',
      points: '8',
      collected: 0,
      icon: '🍾',
      color: '#10B981',
      comboMultiplier: 1.1,
      fact: 'Le verre est recyclable à l\'infini',
      impact: 'Économise 1.2kg de sable par kg'
    },
    { 
      nom: 'Papier',
      points: '5',
      collected: 0,
      icon: '📄',
      color: '#FBBF24',
      comboMultiplier: 1.0,
      fact: '1T de papier recyclé = 17 arbres sauvés',
      impact: 'Réduit la déforestation'
    },
    { 
      nom: 'Métal',
      points: '12',
      collected: 0,
      icon: '🥫',
      color: '#EF4444',
      comboMultiplier: 1.3,
      fact: 'L\'aluminium recyclé économise 95% d\'énergie',
      impact: 'Préserve les ressources minières'
    }
  ];

  ngOnInit() {
    this.spawnPowerUp();
    this.showRandomFact();
  }

  private showRandomFact() {
    const material = this.materiaux[Math.floor(Math.random() * this.materiaux.length)];
    this.currentFact = material.fact || '';
    setTimeout(() => this.showRandomFact(), 10000); // Change fact every 10s
  }

  collectItem(item: Material, event: MouseEvent) {
    const now = Date.now();
    const element = event.target as HTMLElement;
    
    // Check for combo
    if (item.lastCollected && now - item.lastCollected < (2000 + this.getComboBonus())) {
      this.incrementCombo();
    } else {
      this.resetCombo();
    }
    item.lastCollected = now;

    // Calculate points with combo multiplier and rewards
    const basePoints = parseInt(item.points);
    const comboBonus = this.comboCount * item.comboMultiplier;
    const rewardBonus = this.getRewardBonus(item);
    const totalPoints = Math.round(basePoints * (1 + comboBonus) * rewardBonus);

    // Update environmental impact
    this.updateEnvironmentalImpact(item);

    // Visual feedback
    element.classList.add(this.comboCount > 3 ? 'mega-collect' : 'collected');
    this.createScorePopup(event.clientX, event.clientY, `+${totalPoints}`);
    this.createParticles(event.clientX, event.clientY, item.color);
    this.showImpactPopup(item.impact || '');

    // Update game state
    item.collected++;
    this.score += totalPoints;
    this.checkLevelUp();
    this.checkAchievements();

    // Reset animation class
    setTimeout(() => {
      element.classList.remove('collected', 'mega-collect');
    }, 500);
  }

  private updateEnvironmentalImpact(item: Material) {
    // Update environmental metrics based on material type
    switch(item.nom) {
      case 'Plastique':
        this.co2Saved += 1.5;
        break;
      case 'Papier':
        this.treesPlanted += 0.1;
        this.co2Saved += 0.9;
        break;
      case 'Verre':
        this.waterSaved += 2;
        break;
      case 'Métal':
        this.co2Saved += 2;
        break;
    }
  }

  private getRewardBonus(item: Material): number {
    let bonus = 1;
    this.rewards.forEach(reward => {
      if (reward.unlocked) {
        if (reward.name === 'Eco-Warrior' && item.nom === 'Plastique') {
          bonus *= reward.bonus;
        } else if (reward.name === 'Gardien de la Terre') {
          bonus *= reward.bonus;
        }
      }
    });
    return bonus;
  }

  private getComboBonus(): number {
    const masterRecycleur = this.rewards.find(r => r.name === 'Master Recycleur');
    return masterRecycleur?.unlocked ? masterRecycleur.bonus * 1000 : 0;
  }

  private showImpactPopup(impact: string) {
    const popup = document.createElement('div');
    popup.className = 'impact-popup';
    popup.innerHTML = `
      <div class="bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-lg">
        ${impact}
      </div>
    `;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 2000);
  }

  private incrementCombo() {
    clearTimeout(this.comboTimer);
    this.comboCount++;
    this.comboMultiplier = 1 + (this.comboCount * 0.1);
    this.comboTimer = setTimeout(() => this.resetCombo(), 2000);
  }

  private resetCombo() {
    this.comboCount = 0;
    this.comboMultiplier = 1;
  }

  private checkLevelUp() {
    if (this.score >= this.nextLevelScore) {
      this.level++;
      this.nextLevelScore = Math.round(this.nextLevelScore * 1.5);
      
      // Check for rewards
      const reward = this.rewards.find(r => r.level === this.level);
      if (reward && !reward.unlocked) {
        reward.unlocked = true;
        this.showAchievementPopup(`Récompense débloquée: ${reward.name}`, reward.icon);
      }
      
      this.showAchievementPopup('Niveau ' + this.level + ' !', '🎯');
      this.spawnPowerUp();
    }
  }

  private checkAchievements() {
    this.achievements.forEach(achievement => {
      if (!achievement.unlocked) {
        let requirementMet = false;
        
        switch (achievement.type) {
          case 'collection':
            requirementMet = this.materiaux.some(m => m.collected >= achievement.requirement);
            break;
          case 'combo':
            requirementMet = this.comboCount >= achievement.requirement;
            break;
          case 'score':
            requirementMet = this.score >= achievement.requirement;
            break;
        }

        if (requirementMet) {
          achievement.unlocked = true;
          this.showAchievementPopup(achievement.name, achievement.icon);
        }
      }
    });
  }

  private spawnPowerUp() {
    const powerUp = {
      x: Math.random() * 80 + 10, // 10-90% of width
      y: Math.random() * 80 + 10, // 10-90% of height
      type: Math.random() > 0.5 ? 'double' : 'combo',
      icon: Math.random() > 0.5 ? '⚡' : '✨'
    };
    this.powerUps.push(powerUp);

    // Remove power-up after 5 seconds
    setTimeout(() => {
      const index = this.powerUps.indexOf(powerUp);
      if (index > -1) {
        this.powerUps.splice(index, 1);
      }
    }, 5000);
  }

  collectPowerUp(powerUp: any) {
    if (powerUp.type === 'double') {
      this.comboMultiplier *= 2;
      setTimeout(() => this.comboMultiplier /= 2, 5000);
    } else {
      this.comboCount += 3;
    }
    
    const index = this.powerUps.indexOf(powerUp);
    if (index > -1) {
      this.powerUps.splice(index, 1);
    }
  }

  private showAchievementPopup(text: string, icon: string) {
    const popup = document.createElement('div');
    popup.className = 'achievement-popup';
    popup.innerHTML = `${icon} ${text}`;
    document.body.appendChild(popup);
    
    setTimeout(() => popup.remove(), 3000);
  }

  private createParticles(x: number, y: number, color: string) {
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.backgroundColor = color;
      particle.style.transform = `rotate(${Math.random() * 360}deg)`;
      
      // Random direction
      const angle = (Math.PI * 2 * i) / 12;
      const velocity = 2 + Math.random() * 2;
      particle.style.setProperty('--vx', `${Math.cos(angle) * velocity}`);
      particle.style.setProperty('--vy', `${Math.sin(angle) * velocity}`);
      
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 1000);
    }
  }

  private createScorePopup(x: number, y: number, text: string) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.innerHTML = `
      <span class="text-2xl font-bold" style="color: ${this.comboCount > 0 ? '#ff6b6b' : '#22c55e'}">
        ${text}${this.comboCount > 0 ? ` x${this.comboCount + 1}` : ''}
      </span>
    `;
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 1000);
  }

  getUnlockedAchievementsCount(): number {
    return this.achievements.filter(a => a.unlocked).length;
  }
} 