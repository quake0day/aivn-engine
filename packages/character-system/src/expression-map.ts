/** Default expression → morph target mappings */

export interface ExpressionMapping {
  morphTargets: Record<string, number>;
}

const DEFAULT_EXPRESSIONS: Record<string, ExpressionMapping> = {
  neutral: { morphTargets: {} },
  happy: {
    morphTargets: {
      'mouthSmile': 0.8,
      'eyeSquintLeft': 0.3,
      'eyeSquintRight': 0.3,
      'cheekPuff': 0.2,
    },
  },
  sad: {
    morphTargets: {
      'mouthFrownLeft': 0.6,
      'mouthFrownRight': 0.6,
      'browInnerUp': 0.7,
      'eyeSquintLeft': 0.2,
      'eyeSquintRight': 0.2,
    },
  },
  angry: {
    morphTargets: {
      'browDownLeft': 0.8,
      'browDownRight': 0.8,
      'mouthFrownLeft': 0.4,
      'mouthFrownRight': 0.4,
      'jawForward': 0.3,
    },
  },
  surprised: {
    morphTargets: {
      'browOuterUpLeft': 0.9,
      'browOuterUpRight': 0.9,
      'eyeWideLeft': 0.7,
      'eyeWideRight': 0.7,
      'jawOpen': 0.4,
    },
  },
  determined: {
    morphTargets: {
      'browDownLeft': 0.4,
      'browDownRight': 0.4,
      'mouthPressLeft': 0.5,
      'mouthPressRight': 0.5,
    },
  },
  worried: {
    morphTargets: {
      'browInnerUp': 0.8,
      'mouthFrownLeft': 0.3,
      'mouthFrownRight': 0.3,
      'eyeSquintLeft': 0.15,
      'eyeSquintRight': 0.15,
    },
  },
};

export class ExpressionManager {
  private customExpressions = new Map<string, Record<string, ExpressionMapping>>();

  getExpression(characterId: string, expressionName: string): ExpressionMapping {
    const charExpressions = this.customExpressions.get(characterId);
    if (charExpressions && charExpressions[expressionName]) {
      return charExpressions[expressionName];
    }
    return DEFAULT_EXPRESSIONS[expressionName] ?? DEFAULT_EXPRESSIONS['neutral'];
  }

  registerExpression(characterId: string, name: string, mapping: ExpressionMapping): void {
    let charExpressions = this.customExpressions.get(characterId);
    if (!charExpressions) {
      charExpressions = {};
      this.customExpressions.set(characterId, charExpressions);
    }
    charExpressions[name] = mapping;
  }
}
