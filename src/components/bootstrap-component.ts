import * as path from 'path'
import * as directoryTree from 'directory-tree'
import { Eta } from 'eta'
import { NodeProject } from 'projen/lib/javascript'
import { BaseComponent } from './base-component'
import { GenContext } from './contexts'

export class BootstrapComponent extends BaseComponent {
  private readonly templateRoot: string
  private readonly eta: Eta

  constructor(project: NodeProject, genContext: GenContext) {
    super(project, genContext)
    this.templateRoot = path.join(__dirname, '../templates', genContext.templateName)
    this.eta = new Eta({
      views: this.templateRoot,
      autoEscape: false,
      autoTrim: false,
    })
  }

  synthesize() {
    super.synthesize()

    const tree = directoryTree(this.templateRoot)
    this.renderTree(tree)
  }

  renderTree(node: directoryTree.DirectoryTree<Record<string, any>>) {
    if (node.children) {
      for (const child in node.children) {
        this.renderTree(node.children[child])
      }
    } else {
      const relativePath = node.path.replace(this.templateRoot, '.')

      const fileContent = this.eta.render(relativePath, this.genContext)

      const filePath = relativePath.replace('.eta', '').replace('.sample', '')
      if (node.name.includes('.sample.eta')) {
        this.createSampleFile(filePath, fileContent)
      } else if (node.name.includes('.json')) {
        this.createJsonFile(filePath, JSON.parse(fileContent))
      } else if (node.name.includes('.yaml') || node.name.includes('.yml')) {
        this.createYamlFile(filePath, fileContent)
      } else if (filePath.includes('/bin')) {
        this.createTextFile(filePath, fileContent, {
          readonly: true,
          marker: false,
          executable: true,
        })
      } else {
        this.createTextFile(filePath, fileContent)
      }
    }
  }
}
