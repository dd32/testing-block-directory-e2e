/**
 * WordPress dependencies
 */
import {
	createNewPost,
	insertBlock,
	getAllBlocks,
} from '@wordpress/e2e-test-utils';

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
		await insertBlock( process.env.BLOCK_NAME );
		expect( await getAllBlocks() ).toHaveLength( 1 );
	} );
} );
