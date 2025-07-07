import { supabase } from './supabase'
import { v4 as uuidv4 } from 'uuid'

export interface DesignRequest {
  garmentImage: File
  styleSwatchImage?: File
  designPrompt: string
  userId?: string
}

export interface ProcessingStep {
  step_id: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress?: number
  error_message?: string
  started_at?: string
  completed_at?: string
  result_data?: unknown
}

export class DesignProcessor {
  private designId: string
  private steps: ProcessingStep[]

  constructor(designId: string) {
    this.designId = designId
    this.steps = [
      { step_id: 'upload', status: 'pending' },
      { step_id: 'segmentation', status: 'pending' },
      { step_id: 'concept_generation', status: 'pending' },
      { step_id: 'pattern_drafting', status: 'pending' },
      { step_id: 'fit_simulation', status: 'pending' },
      { step_id: 'tech_pack', status: 'pending' }
    ]
  }

  async createDesign(request: DesignRequest): Promise<string> {
    try {
      // Upload images to Supabase Storage
      const garmentImageUrl = await this.uploadImage(request.garmentImage, 'garment')
      let styleSwatchImageUrl = null
      
      if (request.styleSwatchImage) {
        styleSwatchImageUrl = await this.uploadImage(request.styleSwatchImage, 'style_swatch')
      }

      // Create design record in database
      const { error } = await supabase
        .from('designs')
        .insert({
          id: this.designId,
          user_id: request.userId,
          garment_image_url: garmentImageUrl,
          style_swatch_image_url: styleSwatchImageUrl,
          design_prompt: request.designPrompt,
          status: 'processing',
          current_step: 0,
          progress_data: this.steps,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Mark upload step as completed
      await this.updateStepStatus('upload', 'completed', 100)

      // Start the AI processing pipeline
      this.startProcessing()

      return this.designId
    } catch (error) {
      console.error('Error creating design:', error)
      throw error
    }
  }

  private async uploadImage(file: File, type: string): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${this.designId}_${type}_${Date.now()}.${fileExt}`
    const filePath = `designs/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('design-assets')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('design-assets')
      .getPublicUrl(filePath)

    return publicUrl
  }

  private async startProcessing() {
    try {
      // Step 1: Garment Segmentation
      await this.processSegmentation()
      
      // Step 2: Concept Generation
      await this.processConceptGeneration()
      
      // Step 3: Pattern Drafting
      await this.processPatternDrafting()
      
      // Step 4: 3D Fit Simulation
      await this.processFitSimulation()
      
      // Step 5: Tech Pack Generation
      await this.processTechPackGeneration()

      // Mark design as completed
      await this.updateDesignStatus('completed')
      
    } catch (error) {
      console.error('Processing error:', error)
      await this.updateDesignStatus("error", (error as Error).message)
    }

  private async processSegmentation() {
    await this.updateStepStatus('segmentation', 'processing', 0)
    
    try {
      // Simulate API call to Grounding DINO + SAM
      await this.simulateAPICall('segmentation', 3000)
      
      // Mock result
      const result = {
        mask_url: `https://example.com/masks/${this.designId}_mask.png`,
        bounding_boxes: [
          { label: 'shirt', confidence: 0.95, bbox: [100, 100, 300, 400] }
        ]
      }

      await this.updateStepStatus('segmentation', 'completed', 100, null, result)
    } catch (error) {
      await this.updateStepStatus('segmentation', 'error', 0, error.message)
      throw error
    }
  }

  private async processConceptGeneration() {
    await this.updateStepStatus('concept_generation', 'processing', 0)
    
    try {
      // Simulate API call to SDXL
      await this.simulateAPICall('concept_generation', 5000)
      
      // Mock result
      const result = {
        concept_images: [
          `https://example.com/concepts/${this.designId}_concept_1.png`,
          `https://example.com/concepts/${this.designId}_concept_2.png`,
          `https://example.com/concepts/${this.designId}_concept_3.png`
        ]
      }

      await this.updateStepStatus('concept_generation', 'completed', 100, null, result)
    } catch (error) {
      await this.updateStepStatus('concept_generation', 'error', 0, error.message)
      throw error
    }
  }

  private async processPatternDrafting() {
    await this.updateStepStatus('pattern_drafting', 'processing', 0)
    
    try {
      // Simulate API call to SewFormer
      await this.simulateAPICall('pattern_drafting', 4000)
      
      // Mock result
      const result = {
        pattern_pieces: [
          { name: 'Front Panel', svg_url: `https://example.com/patterns/${this.designId}_front.svg` },
          { name: 'Back Panel', svg_url: `https://example.com/patterns/${this.designId}_back.svg` },
          { name: 'Sleeve', svg_url: `https://example.com/patterns/${this.designId}_sleeve.svg` }
        ]
      }

      await this.updateStepStatus('pattern_drafting', 'completed', 100, null, result)
    } catch (error) {
      await this.updateStepStatus('pattern_drafting', 'error', 0, error.message)
      throw error
    }
  }

  private async processFitSimulation() {
    await this.updateStepStatus('fit_simulation', 'processing', 0)
    
    try {
      // Simulate API call to CLO 3D
      await this.simulateAPICall('fit_simulation', 6000)
      
      // Mock result
      const result = {
        simulation_video: `https://example.com/simulations/${this.designId}_simulation.mp4`,
        fit_analysis: {
          overall_fit: 'good',
          tension_points: ['shoulder', 'waist'],
          recommendations: ['Adjust shoulder width by 2cm', 'Increase waist ease by 1cm']
        }
      }

      await this.updateStepStatus('fit_simulation', 'completed', 100, null, result)
    } catch (error) {
      await this.updateStepStatus('fit_simulation', 'error', 0, error.message)
      throw error
    }
  }

  private async processTechPackGeneration() {
    await this.updateStepStatus('tech_pack', 'processing', 0)
    
    try {
      // Simulate tech pack generation
      await this.simulateAPICall('tech_pack', 2000)
      
      // Mock result
      const result = {
        tech_pack_pdf: `https://example.com/techpacks/${this.designId}_techpack.pdf`,
        bom: [
          { item: 'Main Fabric', quantity: '2.5 yards', cost: '$25.00' },
          { item: 'Thread', quantity: '1 spool', cost: '$3.00' },
          { item: 'Buttons', quantity: '6 pieces', cost: '$2.00' }
        ],
        total_cost: '$30.00'
      }

      await this.updateStepStatus('tech_pack', 'completed', 100, null, result)
    } catch (error) {
      await this.updateStepStatus('tech_pack', 'error', 0, error.message)
      throw error
    }
  }

  private async simulateAPICall(stepId: string, duration: number) {
    const steps = 10
    const stepDuration = duration / steps
    
    for (let i = 1; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration))
      const progress = (i / steps) * 100
      await this.updateStepStatus(stepId, 'processing', progress)
    }
  }

  private async updateStepStatus(
    stepId: string, 
    status: ProcessingStep['status'], 
    progress?: number, 
    errorMessage?: string,
    resultData?: unknown
  ) {
    const stepIndex = this.steps.findIndex(step => step.step_id === stepId)
    if (stepIndex === -1) return

    const now = new Date().toISOString()
    
    this.steps[stepIndex] = {
      ...this.steps[stepIndex],
      status,
      progress,
      error_message: errorMessage,
      result_data: resultData,
      started_at: this.steps[stepIndex].started_at || (status === 'processing' ? now : undefined),
      completed_at: status === 'completed' ? now : undefined
    }

    // Update database
    const { error } = await supabase
      .from('designs')
      .update({
        progress_data: this.steps,
        current_step: stepIndex,
        updated_at: now
      })
      .eq('id', this.designId)

    if (error) {
      console.error('Error updating step status:', error)
    }
  }

  private async updateDesignStatus(status: string, errorMessage?: string) {
    const { error } = await supabase
      .from('designs')
      .update({
        status,
        error_message: errorMessage,
        completed_at: status === 'completed' ? new Date().toISOString() : undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', this.designId)

    if (error) {
      console.error('Error updating design status:', error)
    }
  }
}

export async function createDesign(request: DesignRequest): Promise<string> {
  const designId = uuidv4()
  const processor = new DesignProcessor(designId)
  return await processor.createDesign(request)
}

