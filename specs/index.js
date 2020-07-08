/**
 * External dependencies
 */
const core = require( '@actions/core' );

/**
 * WordPress dependencies
 */
import {
	createNewPost,
	insertBlock,
	getAllBlocks,
} from '@wordpress/e2e-test-utils';



// We don't want to see warnings during these tests
console.warn = () => {}

const getThirdPartyBlocks = async () => {
	return page.evaluate( () => {
		const blocks = wp.data.select( 'core/blocks' ).getBlockTypes();

		return blocks
			.filter( ( i ) => ! i.name.startsWith( 'core' ) )
			.map( ( i ) => i.title );
	} );
};

describe( 'Block Directory Tests', () => {
	beforeAll( async () => {
		await createNewPost();
	} );

	beforeEach( async () => {
		// Remove all blocks from the post so that we're working with a clean slate
		await page.evaluate( () => {
			const blocks = wp.data.select( 'core/block-editor' ).getBlocks();
			const clientIds = blocks.map( ( block ) => block.clientId );
			wp.data.dispatch( 'core/block-editor' ).removeBlocks( clientIds );
		} );
    } );
    
	it( 'Block can be inserted in the document', async () => {
		try {
			const [ block ] = await getThirdPartyBlocks();

			// Make sure it's available
            expect( block ).toBeDefined();
        } catch ( e ) {
			core.setFailed( 'Could not find block in registered block list.' );
        }
        
        try {
			await insertBlock( block );

			expect( await getAllBlocks() ).toHaveLength( 1 );
		} catch ( e ) {
			core.setFailed( 'Block was not found in document after insert.' );
		}
	} );
} );
