import { memo } from 'react'
import { Link } from 'react-router-dom';
import Utils from '../utils';
import BucketTypeIcon from './BucketTypeIcon';

type Bucket = {
  bucket: string;
  manifests: number;
  official: boolean;
};

function BucketsList({ results, keyword }) {
    const keywordRE = new RegExp(`${keyword}`, 'g');  

    const setKeywordHighlight = function(bucketName: string) {
        if (!keyword) {
            return bucketName;
        }

        const ret = bucketName.replace(keywordRE, `<mark style="padding: 0;">${keyword}</mark>`);
        return ret;
    }

    const filterIncludesKeywordBuckets = (item: Bucket) => {
        const bucketName = encodeURIComponent(item.bucket);

        const temp = (
            <tr key={item.bucket}>
                <td>
                <Link
                    to={{
                    pathname: '/apps',
                    search: `?q="${bucketName}"`,
                    }}
                    dangerouslySetInnerHTML={{__html: setKeywordHighlight(Utils.extractPathFromUrl(item.bucket))}}
                >
                </Link>{' '}
                <BucketTypeIcon official={item.official} />
                </td>
                <td>{item.manifests}</td>
            </tr>
        );

        if (!keyword) {
            return temp;
        }
    
        return (
            keywordRE.test(bucketName)
                ? temp
                : null
        )
    }

    return (
        <>
            {results.map((item: Bucket) => filterIncludesKeywordBuckets(item))}
        </>
    )
}

export default memo(BucketsList)