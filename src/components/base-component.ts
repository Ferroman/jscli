import { accessSync, constants } from 'fs'
import { load } from 'js-yaml'
import {
  Component,
  JsonFile,
  Project,
  SampleFile,
  TextFile,
  TextFileOptions,
  YamlFile,
} from 'projen'
import { GenContext } from './contexts'

export abstract class BaseComponent extends Component {
  protected constructor(
    project: Project,
    protected readonly genContext: GenContext,
  ) {
    super(project)

    console.log(`Processing component: ${this.constructor.name}`)
  }

  preSynthesize(): void {
    super.preSynthesize()
    console.log(`preSynthesizing component: ${this.constructor.name}`)
  }

  synthesize(): void {
    super.synthesize()
    console.log(`Synthesizing component: ${this.constructor.name}`)
  }

  postSynthesize(): void {
    super.postSynthesize()
    console.log(`postSynthesizing component: ${this.constructor.name}`)
  }

  private wasModified(filePath: string): boolean {
    try {
      accessSync(filePath, constants.W_OK)
      return true
    } catch {}

    return false
  }

  protected createJsonFileIfNotModified(filePath: string, content: any) {
    if (this.wasModified(filePath)) {
      return
    }

    new JsonFile(this.project, filePath, { obj: content, readonly: true }).synthesize()
  }

  protected createYamlFileIfNotModified(
    filePath: string,
    content: any,
    { readonly }: { readonly: boolean } = { readonly: true },
  ) {
    if (this.wasModified(filePath)) {
      return
    }

    if (typeof content === 'string') {
      content = load(content)
    }

    new YamlFile(this.project, filePath, { obj: content, readonly: readonly }).synthesize()
  }

  protected createTextFileIfNotModified(filePath: string, content: string) {
    if (this.wasModified(filePath)) {
      return
    }

    const textFile = new TextFile(this.project, filePath, { readonly: true })

    if (textFile.marker) {
      textFile.addLine(`// ${textFile.marker}`)
    }

    ;[...content.split('\n')].forEach((l) => textFile.addLine(l))
    textFile.synthesize()
  }

  protected createJsonFile(filePath: string, content: any) {
    new JsonFile(this.project, filePath, {
      obj: content,
      readonly: true,
      marker: true,
    }).synthesize()
  }

  protected createYamlFile(filePath: string, content: any) {
    if (typeof content === 'string') {
      content = load(content)
    }

    new YamlFile(this.project, filePath, {
      obj: content,
      readonly: true,
      marker: true,
    }).synthesize()
  }

  protected createTextFile(
    filePath: string,
    content: string,
    options: TextFileOptions = { readonly: true, marker: true },
  ) {
    const textFile = new TextFile(this.project, filePath, options)

    if (textFile.marker) {
      textFile.addLine(`// ${textFile.marker}`)
    }

    ;[...content.split('\n')].forEach((l) => textFile.addLine(l))
    textFile.synthesize()
  }

  protected createSampleFile(filePath: string, content: string) {
    new SampleFile(this.project, filePath, {
      contents: content,
    }).synthesize()
  }
}
