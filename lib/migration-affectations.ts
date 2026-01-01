/**
 * SCRIPT DE MIGRATION RIGOUREUX
 * 
 * Migrer les affectations accessoires de l'ancien système (vehiculeParentId)
 * vers le nouveau système (collection affectations_accessoires)
 * 
 * Utilise les fonctions utilitaires pour affichage cohérent
 * 
 * À exécuter UNE SEULE FOIS après déploiement
 */

import { 
  getAllEquipements,
  getEquipement,
  createAffectationAccessoire
} from '@/lib/firebase'
import { getEquipementDisplayName } from '@/lib/utils/equipement-display'

export async function migrerAffectationsAccessoires() {
  console.log('🚀 Démarrage migration affectations accessoires...')
  
  try {
    const equipements = await getAllEquipements()
    console.log(`📊 ${equipements.length} équipements trouvés`)

    const accessoiresAvecParent = equipements.filter(e => 
      e.type !== 'vehicule' && (e as any).vehiculeParentId
    )
    
    console.log(`🔧 ${accessoiresAvecParent.length} accessoires avec affectation à migrer`)

    if (accessoiresAvecParent.length === 0) {
      console.log('✅ Aucune affectation à migrer')
      return { success: true, migrated: 0 }
    }

    let migratedCount = 0
    let errorCount = 0

    for (const accessoire of accessoiresAvecParent) {
      try {
        const vehiculeParentId = (accessoire as any).vehiculeParentId
        
        const vehiculeParent = await getEquipement(vehiculeParentId)
        
        if (!vehiculeParent) {
          console.warn(`⚠️ Véhicule parent ${vehiculeParentId} non trouvé pour ${getEquipementDisplayName(accessoire)}`)
          errorCount++
          continue
        }

        const affectationData = {
          accessoireId: accessoire.id,
          accessoireImmat: getEquipementDisplayName(accessoire),
          accessoireType: accessoire.type,
          vehiculeId: vehiculeParentId,
          vehiculeImmat: getEquipementDisplayName(vehiculeParent),
          dateAffectation: new Date().toISOString(),
          permanent: true,
          notes: `Migration automatique depuis vehiculeParentId`
        }

        await createAffectationAccessoire(affectationData)
        
        migratedCount++
        console.log(`✅ ${getEquipementDisplayName(accessoire)} → ${getEquipementDisplayName(vehiculeParent)}`)
      } catch (error) {
        console.error(`❌ Erreur migration ${getEquipementDisplayName(accessoire)}:`, error)
        errorCount++
      }
    }

    console.log('\n📊 RÉSUMÉ MIGRATION')
    console.log(`✅ Migrés avec succès: ${migratedCount}`)
    console.log(`❌ Erreurs: ${errorCount}`)
    console.log(`📊 Total: ${accessoiresAvecParent.length}`)

    return {
      success: errorCount === 0,
      migrated: migratedCount,
      errors: errorCount,
      total: accessoiresAvecParent.length
    }
  } catch (error) {
    console.error('❌ Erreur migration:', error)
    throw error
  }
}

if (typeof window !== 'undefined') {
  (window as any).migrerAffectationsAccessoires = migrerAffectationsAccessoires
}
