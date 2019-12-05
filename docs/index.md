

## **Clin.iobio components** (Phenotype extractor and Gene List)

<br>
### Installation

`$ npm i iobio-phenotype-extractor-vue `
<br>

###  Importing components:  

`import ClinComponents from 'iobio-phenotype-extractor-vue';`
<br>

### Registering components:
```
components: {
	...ClinComponents
}
```

<br>

**Components:**

## Phenotype Extractor

The `PhenotypeExtractor` component is used to enter clinical notes or conditions to extract phenotypes from it. This is the second step in clin.iobio workflow.

#### Example usage:
```
<PhenotypeExtractor
  :phenotypes="analysis.payload.phenotypes"
  @summaryGenes="summaryGenes($event)">
</PhenotypeExtractor>
```

#### API
##### Props:
**name**:  phenotypes
**type**:  `Array`
**Description**:  This prop passes the saved phenotypes from the previous search

##### Events:
 **name**:  summaryGenes
**value**:  `Array`
**Description**:  The compiled gene list from all the tools.




## Gene List
The `GeneList` component displays the generated gene list from all the tools (GTR, Phenolyzer, and HPO). This is the third step in clin.iobio workflow.

#### Example usage:
```
<GeneList
  :summaryGeneList="summaryGeneList">
</GeneList>
```

#### API
##### Props:
**name**:  summaryGeneList
**type**:  `Array`
**Description**:  This prop passes the gene list to the component.  
