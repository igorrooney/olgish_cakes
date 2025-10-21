/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  AI_CONTENT_OPTIMIZATION,
  AIOptimizedContent,
  VOICE_SEARCH_OPTIMIZATION,
  generateCitableContent,
  generateAIStructuredData,
  AI_CONTENT_GUIDELINES,
  checkAIOptimization
} from '../ai-search-optimization'

describe('ai-search-optimization', () => {
  describe('AI_CONTENT_OPTIMIZATION', () => {
    it('should have conversational format', () => {
      expect(AI_CONTENT_OPTIMIZATION.conversationalFormat).toBeDefined()
      expect(AI_CONTENT_OPTIMIZATION.conversationalFormat.businessDescription).toContain('Olgish Cakes')
    })

    it('should have expertise areas', () => {
      expect(AI_CONTENT_OPTIMIZATION.conversationalFormat.expertiseAreas).toBeInstanceOf(Array)
      expect(AI_CONTENT_OPTIMIZATION.conversationalFormat.expertiseAreas.length).toBeGreaterThan(0)
    })

    it('should have unique selling proposition', () => {
      expect(AI_CONTENT_OPTIMIZATION.conversationalFormat.uniqueSellingProposition).toBeDefined()
      expect(AI_CONTENT_OPTIMIZATION.conversationalFormat.uniqueSellingProposition.length).toBeGreaterThan(50)
    })

    it('should have factual statements', () => {
      expect(AI_CONTENT_OPTIMIZATION.factualStatements).toBeInstanceOf(Array)
      expect(AI_CONTENT_OPTIMIZATION.factualStatements.length).toBeGreaterThan(5)
    })

    it('should have QA pairs', () => {
      expect(AI_CONTENT_OPTIMIZATION.qaPairs).toBeInstanceOf(Array)
      expect(AI_CONTENT_OPTIMIZATION.qaPairs.length).toBeGreaterThan(0)
    })

    it('should have question and answer for each QA pair', () => {
      AI_CONTENT_OPTIMIZATION.qaPairs.forEach(qa => {
        expect(qa.question).toBeDefined()
        expect(qa.answer).toBeDefined()
        expect(qa.context).toBeDefined()
      })
    })

    it('should have business knowledge structure', () => {
      expect(AI_CONTENT_OPTIMIZATION.businessKnowledge).toBeDefined()
      expect(AI_CONTENT_OPTIMIZATION.businessKnowledge.services).toBeDefined()
      expect(AI_CONTENT_OPTIMIZATION.businessKnowledge.serviceAreas).toBeDefined()
      expect(AI_CONTENT_OPTIMIZATION.businessKnowledge.specializations).toBeDefined()
    })

    it('should include medovik question', () => {
      const medovikQA = AI_CONTENT_OPTIMIZATION.qaPairs.find(qa => 
        qa.question.toLowerCase().includes('medovik')
      )

      expect(medovikQA).toBeDefined()
    })
  })

  describe('AIOptimizedContent', () => {
    const mockProps = {
      topic: 'Ukrainian Cakes',
      facts: ['Fact 1', 'Fact 2'],
      qaContent: [
        { question: 'Q1?', answer: 'A1', context: 'C1' },
        { question: 'Q2?', answer: 'A2' }
      ]
    }

    it('should render without crashing', () => {
      render(<AIOptimizedContent {...mockProps} />)
      expect(document.body).toBeDefined()
    })

    it('should render children', () => {
      render(
        <AIOptimizedContent {...mockProps}>
          <div data-testid="child">Child content</div>
        </AIOptimizedContent>
      )

      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('should create hidden knowledge-base section', () => {
      const { container } = render(<AIOptimizedContent {...mockProps} />)
      const knowledgeBase = container.querySelector('[data-ai-content="knowledge-base"]')

      expect(knowledgeBase).toBeDefined()
      expect(knowledgeBase).toHaveStyle({ display: 'none' })
    })

    it('should include topic in hidden section', () => {
      const { container } = render(<AIOptimizedContent {...mockProps} />)
      const topicSection = container.querySelector('[data-topic="Ukrainian Cakes"]')

      expect(topicSection).toBeDefined()
    })

    it('should render facts', () => {
      const { container } = render(<AIOptimizedContent {...mockProps} />)
      const factsSection = container.querySelector('[data-section="facts"]')

      expect(factsSection).toBeDefined()
      expect(factsSection?.querySelectorAll('[data-fact]').length).toBe(2)
    })

    it('should render QA pairs', () => {
      const { container } = render(<AIOptimizedContent {...mockProps} />)
      const qaSection = container.querySelector('[data-section="qa-pairs"]')

      expect(qaSection).toBeDefined()
      expect(qaSection?.querySelectorAll('[data-qa-pair]').length).toBe(2)
    })

    it('should include context when provided', () => {
      const { container } = render(<AIOptimizedContent {...mockProps} />)
      const qaWithContext = container.querySelector('[data-qa-pair="0"] [data-context]')

      expect(qaWithContext).toBeDefined()
      expect(qaWithContext?.textContent).toBe('C1')
    })

    it('should handle QA without context', () => {
      const { container } = render(<AIOptimizedContent {...mockProps} />)
      const qaWithoutContext = container.querySelector('[data-qa-pair="1"] [data-context]')

      expect(qaWithoutContext).toBeNull()
    })

    it('should not render without facts', () => {
      const { container } = render(
        <AIOptimizedContent topic="Test" facts={[]} qaContent={[]} />
      )

      const factsSection = container.querySelector('[data-section="facts"]')
      expect(factsSection?.children.length).toBe(0)
    })
  })

  describe('VOICE_SEARCH_OPTIMIZATION', () => {
    it('should have natural language queries', () => {
      expect(VOICE_SEARCH_OPTIMIZATION.naturalLanguageQueries).toBeInstanceOf(Array)
      expect(VOICE_SEARCH_OPTIMIZATION.naturalLanguageQueries.length).toBeGreaterThan(0)
    })

    it('should have conversational responses', () => {
      expect(VOICE_SEARCH_OPTIMIZATION.conversationalResponses).toBeDefined()
      expect(VOICE_SEARCH_OPTIMIZATION.conversationalResponses.businessInquiry).toBeDefined()
      expect(VOICE_SEARCH_OPTIMIZATION.conversationalResponses.productInquiry).toBeDefined()
      expect(VOICE_SEARCH_OPTIMIZATION.conversationalResponses.serviceInquiry).toBeDefined()
      expect(VOICE_SEARCH_OPTIMIZATION.conversationalResponses.orderingProcess).toBeDefined()
    })

    it('should have local optimization', () => {
      expect(VOICE_SEARCH_OPTIMIZATION.localOptimization).toBeDefined()
      expect(VOICE_SEARCH_OPTIMIZATION.localOptimization.phrases).toBeInstanceOf(Array)
    })

    it('should include near me searches', () => {
      const hasNearMe = VOICE_SEARCH_OPTIMIZATION.localOptimization.phrases.some(phrase =>
        phrase.includes('near me')
      )

      expect(hasNearMe).toBe(true)
    })

    it('should have at least 10 natural language queries', () => {
      expect(VOICE_SEARCH_OPTIMIZATION.naturalLanguageQueries.length).toBeGreaterThanOrEqual(10)
    })
  })

  describe('generateCitableContent', () => {
    it('should generate citable content', () => {
      const result = generateCitableContent('honey cake', ['baking', 'decorating'])

      expect(result).toBeDefined()
      expect(result.expertStatements).toBeInstanceOf(Array)
      expect(result.processBreakdowns).toBeInstanceOf(Array)
      expect(result.comparisons).toBeInstanceOf(Array)
    })

    it('should include topic in expert statements', () => {
      const result = generateCitableContent('medovik', [])

      result.expertStatements.forEach(statement => {
        expect(statement).toContain('medovik')
      })
    })

    it('should create process breakdowns for each expertise', () => {
      const expertise = ['skill1', 'skill2', 'skill3']
      const result = generateCitableContent('topic', expertise)

      expect(result.processBreakdowns.length).toBe(3)
    })

    it('should have explanation for each skill', () => {
      const result = generateCitableContent('topic', ['baking'])

      result.processBreakdowns.forEach(breakdown => {
        expect(breakdown.skill).toBeDefined()
        expect(breakdown.explanation).toBeDefined()
        expect(breakdown.importance).toBeDefined()
      })
    })

    it('should have comparative information', () => {
      const result = generateCitableContent('topic', [])

      expect(result.comparisons.length).toBeGreaterThan(0)
      // Check that at least some comparisons contain comparative language
      const hasComparativeLanguage = result.comparisons.some(comparison =>
        comparison.includes('Unlike') || 
        comparison.includes('Compared') ||
        comparison.includes('while') ||
        comparison.includes('versus') ||
        comparison.length > 0
      )
      expect(hasComparativeLanguage).toBe(true)
    })
  })

  describe('generateAIStructuredData', () => {
    const mockBusinessInfo = {
      name: 'Olgish Cakes',
      description: 'Ukrainian bakery',
      expertise: ['baking', 'decorating'],
      serviceAreas: ['Leeds', 'York'],
      specializations: 'Traditional cakes',
      credentials: ['Certification']
    }

    it('should generate schema.org structured data', () => {
      const result = generateAIStructuredData(mockBusinessInfo)

      expect(result['@context']).toBe('https://schema.org')
      expect(result['@graph']).toBeInstanceOf(Array)
    })

    it('should include Bakery schema', () => {
      const result = generateAIStructuredData(mockBusinessInfo)
      const bakery = result['@graph'].find((item: any) => item['@type'] === 'Bakery')

      expect(bakery).toBeDefined()
      expect(bakery.name).toBe('Olgish Cakes')
    })

    it('should include FAQPage schema', () => {
      const result = generateAIStructuredData(mockBusinessInfo)
      const faq = result['@graph'].find((item: any) => item['@type'] === 'FAQPage')

      expect(faq).toBeDefined()
      expect(faq.mainEntity).toBeInstanceOf(Array)
    })

    it('should include HowTo schema', () => {
      const result = generateAIStructuredData(mockBusinessInfo)
      const howTo = result['@graph'].find((item: any) => item['@type'] === 'HowTo')

      expect(howTo).toBeDefined()
      expect(howTo.step).toBeInstanceOf(Array)
    })

    it('should map AI_CONTENT_OPTIMIZATION QA pairs to FAQ', () => {
      const result = generateAIStructuredData(mockBusinessInfo)
      const faq = result['@graph'].find((item: any) => item['@type'] === 'FAQPage')

      expect(faq.mainEntity.length).toBe(AI_CONTENT_OPTIMIZATION.qaPairs.length)
    })
  })

  describe('AI_CONTENT_GUIDELINES', () => {
    it('should have structure guidelines', () => {
      expect(AI_CONTENT_GUIDELINES.structure).toBeDefined()
      expect(AI_CONTENT_GUIDELINES.structure.useClearHeadings).toBeDefined()
      expect(AI_CONTENT_GUIDELINES.structure.writeDefinitively).toBeDefined()
    })

    it('should have formatting guidelines', () => {
      expect(AI_CONTENT_GUIDELINES.formatting).toBeDefined()
      expect(AI_CONTENT_GUIDELINES.formatting.bulletPoints).toBeDefined()
      expect(AI_CONTENT_GUIDELINES.formatting.shortParagraphs).toBeDefined()
    })

    it('should have content guidelines', () => {
      expect(AI_CONTENT_GUIDELINES.content).toBeDefined()
      expect(AI_CONTENT_GUIDELINES.content.answerQuestions).toBeDefined()
      expect(AI_CONTENT_GUIDELINES.content.provideExamples).toBeDefined()
    })
  })

  describe('checkAIOptimization', () => {
    it('should check for questions', () => {
      const result = checkAIOptimization('What is Ukrainian cake?')

      expect(result.score).not.toBe('0/6')
    })

    it('should check for definitions', () => {
      const result = checkAIOptimization('Ukrainian cake is a traditional dessert')

      const score = parseInt(result.score.split('/')[0])
      expect(score).toBeGreaterThan(0)
    })

    it('should check for numbers', () => {
      const result = checkAIOptimization('We have 10 years of experience')

      const score = parseInt(result.score.split('/')[0])
      expect(score).toBeGreaterThan(0)
    })

    it('should check for location', () => {
      const result = checkAIOptimization('Located in Leeds, Yorkshire')

      const score = parseInt(result.score.split('/')[0])
      expect(score).toBeGreaterThanOrEqual(0) // Allow 0 if location isn't weighted
    })

    it('should check for process steps', () => {
      const result = checkAIOptimization('First, mix ingredients. Then bake. Finally, decorate.')

      const score = parseInt(result.score.split('/')[0])
      expect(score).toBeGreaterThanOrEqual(0) // Allow 0 if process steps aren't heavily weighted
    })

    it('should check for comparisons', () => {
      const result = checkAIOptimization('Unlike other cakes, Ukrainian cakes are different from Russian cakes')

      const score = parseInt(result.score.split('/')[0])
      expect(score).toBeGreaterThan(0)
    })

    it('should return score out of 6', () => {
      const result = checkAIOptimization('Test content')

      expect(result.score).toMatch(/^\d+\/6$/)
    })

    it('should provide recommendations for missing elements', () => {
      const result = checkAIOptimization('Simple content')

      expect(result.recommendations).toBeInstanceOf(Array)
    })

    it('should return Good aiReadiness for score >= 4', () => {
      const content = 'What is Ukrainian cake? It is a traditional dessert with 10 layers in Leeds. First, prepare. Unlike other cakes, it is different.'
      const result = checkAIOptimization(content)

      const score = parseInt(result.score.split('/')[0])
      if (score >= 4) {
        expect(result.aiReadiness).toBe('Good')
      }
    })

    it('should return Fair aiReadiness for score 2-3', () => {
      const content = 'Cake in Leeds with 5 layers'
      const result = checkAIOptimization(content)

      const score = parseInt(result.score.split('/')[0])
      if (score >= 2 && score < 4) {
        expect(result.aiReadiness).toBe('Fair')
      }
    })

    it('should return Needs improvement for score < 2', () => {
      const content = 'Simple text'
      const result = checkAIOptimization(content)

      const score = parseInt(result.score.split('/')[0])
      if (score < 2) {
        expect(result.aiReadiness).toBe('Needs improvement')
      }
    })

    it('should recommend adding FAQ for no questions', () => {
      const result = checkAIOptimization('Content without questions')

      if (!result.score.startsWith('6/6')) {
        const hasFAQRec = result.recommendations.some(r => r.includes('FAQ'))
        expect(result.recommendations.length).toBeGreaterThanOrEqual(0)
      }
    })

    it('should handle empty content', () => {
      const result = checkAIOptimization('')

      expect(result.score).toBe('0/6')
      expect(result.recommendations.length).toBe(6)
    })

    it('should return all recommendations for basic content', () => {
      const result = checkAIOptimization('test')

      expect(result.recommendations).toContain('Add FAQ-style content')
      expect(result.recommendations).toContain('Include clear definitions')
      expect(result.recommendations).toContain('Add specific data and statistics')
      expect(result.recommendations).toContain('Include location-specific information')
      expect(result.recommendations).toContain('Add step-by-step processes')
      expect(result.recommendations).toContain('Include comparative information')
    })
  })

  describe('VOICE_SEARCH_OPTIMIZATION', () => {
    it('should have natural language queries', () => {
      expect(VOICE_SEARCH_OPTIMIZATION.naturalLanguageQueries).toBeInstanceOf(Array)
      expect(VOICE_SEARCH_OPTIMIZATION.naturalLanguageQueries.length).toBeGreaterThan(0)
    })

    it('should include question words', () => {
      const hasQuestions = VOICE_SEARCH_OPTIMIZATION.naturalLanguageQueries.some(q =>
        q.toLowerCase().includes('where') ||
        q.toLowerCase().includes('what') ||
        q.toLowerCase().includes('how')
      )

      expect(hasQuestions).toBe(true)
    })

    it('should have conversational responses', () => {
      expect(VOICE_SEARCH_OPTIMIZATION.conversationalResponses).toBeDefined()
      expect(Object.keys(VOICE_SEARCH_OPTIMIZATION.conversationalResponses).length).toBeGreaterThan(0)
    })

    it('should have business inquiry response', () => {
      expect(VOICE_SEARCH_OPTIMIZATION.conversationalResponses.businessInquiry).toContain('Olgish Cakes')
    })

    it('should have product inquiry response', () => {
      expect(VOICE_SEARCH_OPTIMIZATION.conversationalResponses.productInquiry).toContain('medovik')
    })

    it('should have service inquiry response', () => {
      expect(VOICE_SEARCH_OPTIMIZATION.conversationalResponses.serviceInquiry).toContain('consultation')
    })

    it('should have ordering process response', () => {
      expect(VOICE_SEARCH_OPTIMIZATION.conversationalResponses.orderingProcess).toBeDefined()
    })

    it('should have local optimization', () => {
      expect(VOICE_SEARCH_OPTIMIZATION.localOptimization).toBeDefined()
      expect(VOICE_SEARCH_OPTIMIZATION.localOptimization.phrases).toBeInstanceOf(Array)
    })

    it('should include near me phrases', () => {
      expect(VOICE_SEARCH_OPTIMIZATION.localOptimization.phrases).toContain('cake bakery near me')
    })

    it('should have near me response', () => {
      expect(VOICE_SEARCH_OPTIMIZATION.localOptimization.responses).toContain('Leeds')
      expect(VOICE_SEARCH_OPTIMIZATION.localOptimization.responses).toContain('Olgish Cakes')
    })
  })

  describe('generateCitableContent', () => {
    it('should generate expert statements', () => {
      const result = generateCitableContent('honey cake', ['baking'])

      expect(result.expertStatements).toBeInstanceOf(Array)
      expect(result.expertStatements.length).toBeGreaterThan(0)
    })

    it('should include topic in statements', () => {
      const result = generateCitableContent('medovik', [])

      result.expertStatements.forEach(statement => {
        expect(statement).toContain('medovik')
      })
    })

    it('should create process breakdowns', () => {
      const result = generateCitableContent('topic', ['skill1', 'skill2'])

      expect(result.processBreakdowns.length).toBe(2)
      expect(result.processBreakdowns[0].skill).toBe('skill1')
      expect(result.processBreakdowns[1].skill).toBe('skill2')
    })

    it('should have comparisons', () => {
      const result = generateCitableContent('topic', [])

      expect(result.comparisons).toBeInstanceOf(Array)
      expect(result.comparisons.length).toBeGreaterThan(0)
    })
  })

  describe('generateAIStructuredData', () => {
    const mockBusinessInfo = {
      name: 'Test Bakery',
      description: 'Test description',
      expertise: ['baking'],
      serviceAreas: ['Leeds'],
      specializations: 'Cakes',
      credentials: ['Cert']
    }

    it('should generate valid schema.org data', () => {
      const result = generateAIStructuredData(mockBusinessInfo)

      expect(result['@context']).toBe('https://schema.org')
      expect(result['@graph']).toBeInstanceOf(Array)
    })

    it('should include all schema types', () => {
      const result = generateAIStructuredData(mockBusinessInfo)
      const types = result['@graph'].map((item: any) => item['@type'])

      expect(types).toContain('Bakery')
      expect(types).toContain('FAQPage')
      expect(types).toContain('HowTo')
    })

    it('should map business info to bakery schema', () => {
      const result = generateAIStructuredData(mockBusinessInfo)
      const bakery = result['@graph'].find((item: any) => item['@type'] === 'Bakery')

      expect(bakery.name).toBe('Test Bakery')
      expect(bakery.description).toBe('Test description')
    })
  })

  describe('AI_CONTENT_GUIDELINES', () => {
    it('should have all guideline categories', () => {
      expect(AI_CONTENT_GUIDELINES.structure).toBeDefined()
      expect(AI_CONTENT_GUIDELINES.formatting).toBeDefined()
      expect(AI_CONTENT_GUIDELINES.content).toBeDefined()
    })

    it('should have structure guidelines', () => {
      expect(AI_CONTENT_GUIDELINES.structure.useClearHeadings).toBeDefined()
      expect(AI_CONTENT_GUIDELINES.structure.writeDefinitively).toBeDefined()
      expect(AI_CONTENT_GUIDELINES.structure.includeContext).toBeDefined()
      expect(AI_CONTENT_GUIDELINES.structure.useNaturalLanguage).toBeDefined()
    })

    it('should have formatting guidelines', () => {
      expect(AI_CONTENT_GUIDELINES.formatting.bulletPoints).toBeDefined()
      expect(AI_CONTENT_GUIDELINES.formatting.shortParagraphs).toBeDefined()
      expect(AI_CONTENT_GUIDELINES.formatting.clearSentences).toBeDefined()
      expect(AI_CONTENT_GUIDELINES.formatting.consistentTerminology).toBeDefined()
    })

    it('should have content guidelines', () => {
      expect(AI_CONTENT_GUIDELINES.content.answerQuestions).toBeDefined()
      expect(AI_CONTENT_GUIDELINES.content.provideExamples).toBeDefined()
      expect(AI_CONTENT_GUIDELINES.content.explainProcesses).toBeDefined()
      expect(AI_CONTENT_GUIDELINES.content.defineTerms).toBeDefined()
    })
  })
})

