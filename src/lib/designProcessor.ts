
import { createClient } from '@supabase/supabase-js'
import { DesignData, ProgressStep } from '@/types'

interface ProcessingStep {
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: string;
  error_message?: string;
}

export class DesignProcessor {
  private supabase: any;
  private designId: string;

  constructor(designId: string) {
    this.designId = designId;
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  public async processDesign(designData: DesignData) {
    try {
      await this.updateDesignStatus('processing');

      // Phase 1: Segmentation
      await this.processSegmentation();

      // Phase 2: Concept Generation
      await this.processConceptGeneration();

      // Phase 3: Pattern Drafting
      await this.processPatternDrafting();

      await this.updateDesignStatus('completed');
    } catch (error) {
      console.error('Processing error:', error);
      await this.updateDesignStatus('error', (error as Error).message);
    }
  }

  private async updateDesignStatus(status: DesignData['status'], errorMessage?: string) {
    const updates: Partial<DesignData> = { status };
    if (errorMessage) {
      updates.error_message = errorMessage;
    }
    await this.supabase
      .from('designs')
      .update(updates)
      .eq('id', this.designId);
  }

  private async updateStepStatus(
    stepName: ProgressStep['name'],
    status: ProgressStep['status'],
    progress: number,
    errorMessage?: string,
    result?: string
  ) {
    const newStep: ProgressStep = {
      name: stepName,
      status,
      progress,
    };
    if (errorMessage) {
      newStep.error_message = errorMessage;
    }
    if (result) {
      newStep.result = result;
    }

    // Fetch current progress_data
    const { data, error } = await this.supabase
      .from('designs')
      .select('progress_data')
      .eq('id', this.designId)
      .single();

    if (error) {
      console.error('Error fetching progress data:', error);
      return;
    }

    let progressData: ProcessingStep[] = data?.progress_data || [];
    const existingStepIndex = progressData.findIndex(step => step.name === stepName);

    if (existingStepIndex !== -1) {
      progressData[existingStepIndex] = { ...progressData[existingStepIndex], ...newStep };
    } else {
      progressData.push(newStep);
    }

    await this.supabase
      .from('designs')
      .update({ progress_data: progressData })
      .eq('id', this.designId);
  }

  private async processSegmentation() {
    await this.updateStepStatus('segmentation', 'processing', 0);

    try {
      // Simulate segmentation process
      const result = 'segmentation_result_url'; // Replace with actual result
      await this.updateStepStatus('segmentation', 'completed', 100, undefined, result);
    } catch (error) {
      await this.updateStepStatus('segmentation', 'error', 0, (error as Error).message);
      throw error;
    }
  }

  private async processConceptGeneration() {
    await this.updateStepStatus('concept_generation', 'processing', 0);

    try {
      // Simulate concept generation process
      const result = 'concept_generation_result_url'; // Replace with actual result
      await this.updateStepStatus('concept_generation', 'completed', 100, undefined, result);
    } catch (error) {
      await this.updateStepStatus('concept_generation', 'error', 0, (error as Error).message);
      throw error;
    }
  }

  private async processPatternDrafting() {
    await this.updateStepStatus('pattern_drafting', 'processing', 0);

    try {
      // Simulate pattern drafting process
      const result = 'pattern_drafting_result_url'; // Replace with actual result
      await this.updateStepStatus('pattern_drafting', 'completed', 100, undefined, result);
    } catch (error) {
      await this.updateStepStatus('pattern_drafting', 'error', 0, (error as Error).message);
      throw error;
    }
  }
}


