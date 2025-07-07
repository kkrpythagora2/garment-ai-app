      await this.updateStepStatus('concept_generation', 'completed', 100, undefined, result)
    } catch (error) {
      await this.updateStepStatus('concept_generation', 'error', 0, (error as Error).message)
      throw error
    }