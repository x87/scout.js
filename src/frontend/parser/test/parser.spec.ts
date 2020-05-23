import Parser from '../';
import ScriptFile from 'frontend/script/ScriptFile';
import { DefinitionMap } from 'common/interfaces';
import { eParamType, eScriptType } from 'common/enums';
import { IInstruction } from 'common/instructions';

describe(Parser.name, () => {
  let parser: Parser;

  beforeEach(() => {
    const opcodes: DefinitionMap = new Map([
      [1, { name: 'WAIT', params: [{ type: 'any' }] }],
      [2, { name: 'GOTO', params: [{ type: 'any' }] }],
      [
        0x4f,
        {
          name: 'START_NEW_SCRIPT',
          params: [{ type: 'any' }, { type: 'arguments' }],
        },
      ],
    ]);
    parser = new Parser(opcodes);
  });

  it('should create a Script out of input ScriptFile', () => {
    const scriptFile = new ScriptFile(Buffer.from([]));
    const spy = spyOn(parser, 'getInstructions').and.callThrough();
    const script = parser.parse(scriptFile);

    expect(script.length).toBe(1);
    expect(script[0].type).toBe(eScriptType.HEADLESS);
    expect(script[0].instructionMap instanceof Map).toBe(true);
    expect(spy).toHaveBeenCalledWith(scriptFile);
  });

  it('should parse instructions out of input ScriptFile', () => {
    const buf = Buffer.from(`0100040002000164000000`, 'hex');
    const scriptFile = new ScriptFile(buf);

    const parsed: IInstruction[] = [
      {
        opcode: 1,
        offset: 0,
        params: [
          {
            type: eParamType.NUM8,
            value: 0,
          },
        ],
      },
      {
        opcode: 2,
        offset: 4,
        params: [
          {
            type: eParamType.NUM32,
            value: 100,
          },
        ],
      },
    ];
    const instructionMap = parser.getInstructions(scriptFile);

    for (const [offset, instruction] of instructionMap) {
      expect(instruction).toEqual(parsed.shift());
    }
  });

  it('should parse instruction with variable number of arguments', () => {
    const buf = Buffer.from(`4F00010100000000`, 'hex');
    const scriptFile = new ScriptFile(buf);

    const parsed: IInstruction[] = [
      {
        opcode: 0x4f,
        offset: 0,
        params: [
          {
            type: eParamType.NUM32,
            value: 1,
          },
        ],
      },
    ];
    const instructionMap = parser.getInstructions(scriptFile);

    for (const [offset, instruction] of instructionMap) {
      expect(instruction).toEqual(parsed.shift());
    }
  });
});
