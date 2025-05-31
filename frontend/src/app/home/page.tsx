import { Box, Grid, GridItem, ListItem, Text, UnorderedList } from '@chakra-ui/react'
import { PageLayout } from '../components/layout/PageLayout'

export default function HomePage() {
  return (
    <PageLayout>
      <Grid templateColumns={'16'}>
        <GridItem colSpan={4}>
          <Box bgColor={'gray.600'}>
            <Text>Equipes</Text>
            <UnorderedList>
              <ListItem>Equipe 1</ListItem>
              <ListItem>Equipe 2</ListItem>
              <ListItem>Equipe 3</ListItem>
              <ListItem>Equipe 4</ListItem>
            </UnorderedList>
          </Box>
        </GridItem>
        <GridItem
          colSpan={4}
          colStart={12}
        >
          <Box bgColor={'gray.600'}>
            <Text>Etapas da documentacao</Text>
            <UnorderedList>
              <ListItem>
                Documento 1<Text>Progresso 2/6</Text>
              </ListItem>
              <ListItem>
                Documento 2<Text>Progresso 1/6</Text>
              </ListItem>
              <ListItem>
                Documento 3<Text>Progresso 5/6</Text>
              </ListItem>
              <ListItem>
                Documento 4<Text>Progresso 6/6</Text>
              </ListItem>
            </UnorderedList>
          </Box>
        </GridItem>
      </Grid>
    </PageLayout>
  )
}
