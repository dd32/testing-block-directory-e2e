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

const getThirdPartyBlocks = async () => {
	return page.evaluate( () => {
		const blocks = wp.data.select( 'core/blocks' ).getBlockTypes();

		return blocks
			.filter( ( i ) => ! i.name.startsWith( 'core' ) )
			.map( ( i ) => i.title );
	} );
};

const handleTest = ( testToRun, errorMessage ) => {
	try {
		testToRun();
	} catch (e) {
		core.setFailed( errorMessage );
	}
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

	it( 'Block can be inserted in the document', handleTest( async () => {
        const [ block ] = await getThirdPartyBlocks();

		// Make sure it's available
		expect( block ).toBeDefined();

		await insertBlock( block );
		expect( await getAllBlocks() ).toHaveLength( 0 );

    },  "Error inserting block into document"));
} );
