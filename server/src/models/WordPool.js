/**
 * Hybrid Text Generator
 * Combines template-based, composition-based, and fallback generation
 * for creating dynamic, unique typing content
 */

class HybridTextGenerator {
  constructor() {
    // Initialize generators
    this.compositionGenerator = new CompositionGenerator();
    this.templateGenerator = new TemplateGenerator();
    
    // Cache for generated texts
    this.cache = new Map();
    this.lastRegeneration = Date.now();
    this.regenerationInterval = 3600000; // 1 hour
    
    // Pre-generate cache on startup
    this.initializeCache();
  }

  // ============================================================
  // INITIALIZE CACHE
  // ============================================================
  async initializeCache() {
    console.log('🔄 Initializing text cache...');
    try {
      await this.regenerateCache();
    } catch (error) {
      console.error('⚠️ Cache initialization failed:', error.message);
    }
  }

  // ============================================================
  // MAIN GENERATION METHOD
  // ============================================================
  async generateText(department = 'common', difficulty = 'medium', type = 'sentences') {
    const cacheKey = `${department}_${difficulty}_${type}`;
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.regenerationInterval) {
        return cached.content;
      }
    }

    // Generate new content
    let content;
    let usedMethod = 'fallback';
    
    try {
      // Try composition-based generation first (most dynamic)
      content = this.compositionGenerator.generateContent(
        department, 
        difficulty, 
        type === 'paragraph' ? 6 : 3
      );
      usedMethod = 'composition';
      
      // If content is too short, enhance with template
      if (content.split(' ').length < 15) {
        const templateContent = this.templateGenerator.generateParagraph(
          department, 
          difficulty, 
          type === 'paragraph' ? 6 : 3
        );
        content = `${content} ${templateContent}`;
        usedMethod = 'composition+template';
      }
      
    } catch (error) {
      console.warn(`⚠️ Composition generation failed for ${department}:`, error.message);
      
      try {
        // Fallback to template generation
        content = this.templateGenerator.generateParagraph(
          department, 
          difficulty, 
          type === 'paragraph' ? 6 : 3
        );
        usedMethod = 'template';
      } catch (templateError) {
        console.warn(`⚠️ Template generation failed for ${department}:`, templateError.message);
        
        // Final fallback
        content = this.getFallbackContent(department, difficulty);
        usedMethod = 'fallback';
      }
    }

    // Validate content
    if (!content || content.length < 10) {
      content = this.getFallbackContent(department, difficulty);
      usedMethod = 'fallback';
    }

    // Cache the result
    this.cache.set(cacheKey, {
      content,
      timestamp: Date.now(),
      method: usedMethod,
      department,
      difficulty,
      type
    });

    return content;
  }

  // ============================================================
  // GET BATTLE TEXT (Multiple departments)
  // ============================================================
  async getBattleText(departments = ['common'], difficulty = 'medium', sentenceCount = 15) {
    // Ensure we have at least one department
    const depts = departments.length > 0 ? departments : ['common'];
    const texts = [];
    const perDept = Math.max(1, Math.floor(sentenceCount / depts.length));
    
    for (const dept of depts) {
      try {
        const text = await this.generateText(dept, difficulty, 'sentences');
        
        // Split into sentences and clean up
        const sentences = text
          .split(/[.!?]+\s*/)
          .filter(s => s.trim().length > 5)
          .map(s => s.trim());
        
        // Select random sentences
        const shuffled = sentences.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, Math.min(perDept, shuffled.length));
        
        if (selected.length > 0) {
          texts.push(...selected);
        }
      } catch (error) {
        console.error(`Failed to get text for ${dept}:`, error.message);
        // Add fallback for this department
        const fallback = this.getFallbackContent(dept, difficulty);
        texts.push(fallback);
      }
    }
    
    // Ensure we have enough texts
    while (texts.length < sentenceCount) {
      const fallback = this.getFallbackContent('common', difficulty);
      texts.push(fallback);
    }
    
    // Shuffle and join
    const shuffled = texts.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, sentenceCount);
    
    return selected.join('. ');
  }

  // ============================================================
  // GET SINGLE SENTENCE
  // ============================================================
  async getSentence(department = 'common', difficulty = 'medium') {
    const text = await this.generateText(department, difficulty, 'sentences');
    const sentences = text
      .split(/[.!?]+\s*/)
      .filter(s => s.trim().length > 5)
      .map(s => s.trim());
    
    return sentences.length > 0 
      ? sentences[Math.floor(Math.random() * sentences.length)] 
      : this.getFallbackContent(department, difficulty);
  }

  // ============================================================
  // GET PARAGRAPH
  // ============================================================
  async getParagraph(department = 'common', difficulty = 'medium', sentenceCount = 5) {
    return await this.generateText(department, difficulty, 'paragraph');
  }

  // ============================================================
  // FALLBACK CONTENT
  // ============================================================
  getFallbackContent(department, difficulty) {
    const fallbacks = {
      computer: {
        easy: [
          "Coding is the art of creating digital solutions that solve real-world problems.",
          "Programming requires logical thinking and attention to detail.",
          "Software development is a journey of continuous learning and improvement."
        ],
        medium: [
          "The journey of a software developer involves constant learning and adaptation to new technologies.",
          "Writing clean, maintainable code is as important as making it work correctly.",
          "Computer science is the study of algorithms, data structures, and computational systems."
        ],
        hard: [
          "Mastering the craft of programming requires understanding both the science of computation and the art of problem-solving.",
          "The field of computer science encompasses everything from theoretical foundations to practical applications.",
          "Effective software engineering balances technical excellence with business requirements."
        ],
        expert: [
          "The evolution of programming languages reflects the ongoing quest for better ways to express computational ideas and solve complex problems."
        ]
      },
      civil: {
        easy: [
          "Civil engineering builds the foundation of modern society through infrastructure and construction.",
          "Engineers design structures that are safe, sustainable, and functional.",
          "Construction projects require careful planning and execution."
        ],
        medium: [
          "The field of civil engineering encompasses the design, construction, and maintenance of our built environment.",
          "From bridges to buildings, civil engineers shape the world around us.",
          "Infrastructure development is essential for economic growth and community well-being."
        ],
        hard: [
          "Civil engineering combines technical knowledge with practical wisdom to create lasting infrastructure.",
          "The discipline requires understanding of materials, mechanics, and environmental factors."
        ]
      },
      architecture: {
        easy: [
          "Architecture is the thoughtful creation of spaces that enhance human experience and well-being.",
          "Great buildings combine function with beauty and sustainability.",
          "Design is about solving problems creatively."
        ],
        medium: [
          "The art of architecture balances aesthetics, functionality, and sustainability in built environments.",
          "Architecture shapes how we live, work, and interact with our surroundings.",
          "Good design considers both form and function in equal measure."
        ],
        hard: [
          "Architecture reflects the values and aspirations of society, creating spaces that inspire and endure.",
          "The practice of architecture requires understanding of art, science, and human behavior."
        ]
      },
      common: {
        easy: [
          "Learning is a lifelong journey that opens doors to endless possibilities.",
          "Education empowers us to make better decisions and understand the world.",
          "Knowledge is the foundation of personal and professional growth."
        ],
        medium: [
          "The pursuit of knowledge transforms our understanding of the world and ourselves.",
          "Education is not just about gaining information, but about developing wisdom.",
          "Learning skills today prepares us for the challenges of tomorrow."
        ],
        hard: [
          "The journey of education is one of discovery, where each new insight builds upon the last.",
          "True learning goes beyond memorization to deep understanding and application."
        ],
        expert: [
          "The pursuit of knowledge is a noble endeavor that enriches our lives and expands our understanding of the world."
        ]
      }
    };

    const deptFallbacks = fallbacks[department] || fallbacks.common;
    const difficultyFallbacks = deptFallbacks[difficulty] || deptFallbacks.medium;
    return difficultyFallbacks[Math.floor(Math.random() * difficultyFallbacks.length)];
  }

  // ============================================================
  // REGENERATE CACHE
  // ============================================================
  async regenerateCache() {
    console.log('🔄 Regenerating text cache...');
    const departments = ['common', 'computer', 'civil', 'architecture'];
    const difficulties = ['easy', 'medium', 'hard', 'expert'];
    const types = ['sentences', 'paragraph'];
    
    let successCount = 0;
    let failCount = 0;
    
    for (const dept of departments) {
      for (const diff of difficulties) {
        for (const type of types) {
          try {
            await this.generateText(dept, diff, type);
            successCount++;
          } catch (error) {
            failCount++;
            console.error(`❌ Failed to generate ${dept} ${diff} ${type}:`, error.message);
          }
        }
      }
    }
    
    console.log(`✅ Cache regeneration complete: ${successCount} generated, ${failCount} failed`);
    return { successCount, failCount };
  }

  // ============================================================
  // GET CACHE STATUS
  // ============================================================
  getCacheStatus() {
    const status = {
      totalEntries: this.cache.size,
      entries: [],
      methods: {}
    };
    
    for (const [key, value] of this.cache) {
      status.entries.push({
        key,
        method: value.method,
        age: Math.floor((Date.now() - value.timestamp) / 1000 / 60) + ' minutes',
        length: value.content.length
      });
      
      status.methods[value.method] = (status.methods[value.method] || 0) + 1;
    }
    
    return status;
  }

  // ============================================================
  // CLEAR CACHE
  // ============================================================
  clearCache() {
    this.cache.clear();
    console.log('🧹 Cache cleared');
    return { cleared: true };
  }
}

// ============================================================
// COMPOSITION GENERATOR (Embedded)
// ============================================================
class CompositionGenerator {
  constructor() {
    this.wordBanks = {
      subjects: {
        computer: ['programming', 'software', 'code', 'algorithm', 'data', 'system', 'application'],
        civil: ['infrastructure', 'construction', 'bridge', 'building', 'structure', 'design'],
        architecture: ['design', 'space', 'form', 'structure', 'aesthetics', 'function'],
        common: ['learning', 'growth', 'knowledge', 'understanding', 'wisdom', 'skill']
      },
      actions: ['requires', 'demands', 'involves', 'encompasses', 'integrates', 'harmonizes'],
      outcomes: ['success', 'growth', 'innovation', 'excellence', 'mastery', 'transformation'],
      adjectives: ['profound', 'transformative', 'innovative', 'strategic', 'holistic', 'dynamic'],
      adverbs: ['effectively', 'efficiently', 'creatively', 'strategically', 'systematically'],
      connectors: ['The essence of', 'Understanding', 'Mastering', 'Exploring', 'Embracing']
    };

    this.patterns = [
      {
        structure: ['connector', 'subject', 'action', 'adjective', 'outcome'],
        template: (words) => `${words.connector} ${words.subject} ${words.action} ${words.adjective} ${words.outcome}.`
      },
      {
        structure: ['subject', 'action', 'outcome', 'through', 'approach'],
        template: (words) => `${words.subject} ${words.action} ${words.outcome} through ${words.adjective} approach.`
      },
      {
        structure: ['approach', 'to', 'subject', 'is', 'key', 'for', 'outcome'],
        template: (words) => `${words.adjective} approach to ${words.subject} is key for ${words.outcome}.`
      }
    ];
  }

  generateContent(department = 'common', difficulty = 'medium', sentenceCount = 5) {
    const subjectBank = this.wordBanks.subjects[department] || this.wordBanks.subjects.common;
    const difficultyMultiplier = { easy: 1, medium: 2, hard: 3, expert: 4 };
    const wordCount = Math.min(difficultyMultiplier[difficulty] || 2, subjectBank.length);
    const selectedSubjects = subjectBank.sort(() => 0.5 - Math.random()).slice(0, wordCount);
    const subject = selectedSubjects.join(' ');

    const sentences = [];
    for (let i = 0; i < sentenceCount; i++) {
      const words = {
        connector: this.wordBanks.connectors[Math.floor(Math.random() * this.wordBanks.connectors.length)],
        subject: subject,
        action: this.wordBanks.actions[Math.floor(Math.random() * this.wordBanks.actions.length)],
        adjective: this.wordBanks.adjectives[Math.floor(Math.random() * this.wordBanks.adjectives.length)],
        outcome: this.wordBanks.outcomes[Math.floor(Math.random() * this.wordBanks.outcomes.length)],
        approach: this.wordBanks.adjectives[Math.floor(Math.random() * this.wordBanks.adjectives.length)]
      };

      const pattern = this.patterns[Math.floor(Math.random() * this.patterns.length)];
      sentences.push(pattern.template(words));
    }

    return sentences.join(' ');
  }
}

// ============================================================
// TEMPLATE GENERATOR (Embedded)
// ============================================================
class TemplateGenerator {
  constructor() {
    this.templates = {
      computer: {
        easy: [
          ["programming", "coding", "software", "developer", "algorithm"],
          ["code", "debug", "compile", "execute", "optimize"],
          ["function", "variable", "loop", "array", "object"]
        ],
        medium: [
          ["software development", "web applications", "mobile apps", "cloud computing"],
          ["data structures", "machine learning", "artificial intelligence"],
          ["agile methodology", "test driven development", "continuous integration"]
        ],
        hard: [
          ["distributed systems", "microservices architecture", "containerization"],
          ["design patterns", "software architecture", "system design"],
          ["database optimization", "caching strategies", "load balancing"]
        ],
        expert: [
          ["quantum computing", "neural networks", "blockchain technology"],
          ["functional programming", "concurrent systems", "distributed computing"]
        ]
      },
      civil: {
        easy: [
          ["building", "construction", "bridge", "road", "structure"],
          ["concrete", "steel", "foundation", "beam", "column"],
          ["surveying", "materials", "engineering", "design", "safety"]
        ],
        medium: [
          ["infrastructure development", "urban planning", "environmental engineering"],
          ["structural analysis", "transportation systems", "water resources"],
          ["construction management", "project planning", "quality control"]
        ],
        hard: [
          ["geotechnical engineering", "earthquake resistance", "sustainable design"],
          ["hydraulic systems", "transportation networks", "environmental impact"]
        ]
      },
      architecture: {
        easy: [
          ["design", "space", "building", "structure", "form"],
          ["light", "materials", "scale", "proportion", "balance"],
          ["sketch", "model", "render", "concept", "vision"]
        ],
        medium: [
          ["sustainable architecture", "urban design", "landscape architecture"],
          ["building technology", "environmental design", "heritage conservation"]
        ]
      },
      common: {
        easy: [
          ["learning", "education", "college", "student", "teacher"],
          ["knowledge", "wisdom", "understanding", "curiosity", "growth"],
          ["community", "collaboration", "teamwork", "support", "success"]
        ],
        medium: [
          ["lifelong learning", "personal development", "professional growth"],
          ["critical thinking", "problem solving", "creative expression"],
          ["global citizenship", "cultural awareness", "social responsibility"]
        ],
        hard: [
          ["interdisciplinary studies", "innovative thinking", "transformative education"],
          ["digital literacy", "information fluency", "media literacy"]
        ]
      }
    };

    this.connectors = [
      "The essence of", "Understanding", "Mastering", 
      "The art of", "Exploring", "The journey of",
      "Through the lens of", "Embracing", "Transforming",
      "In the world of", "Beyond the surface of",
      "The foundation of", "Advancing in", "Reimagining"
    ];

    this.verbs = [
      "requires", "demands", "involves", "encompasses", 
      "embraces", "transcends", "integrates", "harmonizes",
      "balances", "synthesizes", "unites", "connects",
      "bridges", "merges", "fuses", "blends"
    ];

    this.adjectives = [
      "profound", "transformative", "revolutionary", "groundbreaking",
      "innovative", "pioneering", "visionary", "strategic",
      "holistic", "comprehensive", "dynamic", "adaptive",
      "resilient", "sustainable", "scalable", "elegant"
    ];

    this.concepts = [
      "growth", "innovation", "creativity", "collaboration",
      "sustainability", "efficiency", "quality", "precision",
      "clarity", "purpose", "impact", "legacy",
      "opportunity", "challenge", "transformation"
    ];
  }

  generateParagraph(department = 'common', difficulty = 'medium', sentenceCount = 5) {
    const templates = this.templates[department] || this.templates.common;
    const words = templates[difficulty] || templates.medium;
    
    const sentences = [];
    for (let i = 0; i < sentenceCount; i++) {
      const template = words[Math.floor(Math.random() * words.length)];
      const connector = this.connectors[Math.floor(Math.random() * this.connectors.length)];
      const adjective = this.adjectives[Math.floor(Math.random() * this.adjectives.length)];
      const concept = this.concepts[Math.floor(Math.random() * this.concepts.length)];
      const verb = this.verbs[Math.floor(Math.random() * this.verbs.length)];
      
      const structures = [
        `${connector} ${template.join(' ')} ${verb} ${adjective} ${concept}.`,
        `${template[0].charAt(0).toUpperCase() + template[0].slice(1)} ${verb} ${template.slice(1).join(' ')} in ${adjective} ways.`,
        `${connector} ${template.slice(0,2).join(' ')} ${verb} our understanding of ${concept}.`,
        `Through ${template.join(' ')}, we discover the ${adjective} power of ${concept}.`,
        `${template.join(' ')} ${verb} to create ${adjective} solutions in today's world.`
      ];
      
      sentences.push(structures[Math.floor(Math.random() * structures.length)]);
    }
    
    return sentences.join(' ');
  }
}

module.exports = new HybridTextGenerator();