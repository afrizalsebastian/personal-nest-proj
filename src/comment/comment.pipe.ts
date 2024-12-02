import { HttpException, Injectable, PipeTransform } from '@nestjs/common';
import { CommentQueryExtract } from 'src/dtos/comment.dto';

const validSortKey = ['id', 'createdAt'];
const validRangedKey = ['createdAt'];

@Injectable()
export class QueryCommentPipe implements PipeTransform {
  transform(value: any) {
    const where = { AND: [] };
    let page = 1;
    let rows = 5;
    const orderBy = {};

    for (const key in value) {
      if (value[key])
        if (key === 'page') {
          page = value.page ? parseInt(value.page) : 1;
          if (isNaN(page))
            throw new HttpException('Query Page Parse Invalid', 400);
        } else if (key === 'rows') {
          rows = value.rows ? parseInt(value.rows) : 5;
          if (isNaN(rows))
            throw new HttpException('Query Rows Parse Invalid', 400);
        } else if (key.includes('sort')) {
          this.buildSortKey(orderBy, value.sort);
        } else if (key.includes('lt') || key.includes('gt')) {
          this.buildRangedKey(where, key, value[key]);
        }
    }

    const result: CommentQueryExtract = {
      page,
      rows,
      where,
      orderBy,
    };

    return result;
  }

  private isValidDate(stringDate: string) {
    return !isNaN(Date.parse(stringDate));
  }

  private isANDHaveTheKey(AND: any[], key: string) {
    for (let i = 0; i < AND.length; i++) {
      if (AND[i][key]) return i;
    }
    return -1;
  }

  private buildSortKey(orderBy: any, sortKey: string) {
    if (
      !validSortKey.includes(
        sortKey[0] === '-' ? sortKey.substring(1, sortKey.length) : sortKey,
      )
    )
      throw new HttpException(
        `Invalid key for sort. Available sort key ${validSortKey.join(', ')}`,
        400,
      );

    if (sortKey[0] === '-')
      orderBy[`${sortKey.substring(1, sortKey.length)}`] = 'desc';
    else orderBy[`${sortKey}`] = 'asc';
  }

  private buildRangedKey(where: any, key: string, queryValue: string) {
    const [rangedKey, comparison] = key.split('.');

    if (!validRangedKey.includes(rangedKey))
      throw new HttpException(
        `Invalid key for ranged. Available ranged key ${validRangedKey.join(', ')}`,
        400,
      );

    const keyIndex = this.isANDHaveTheKey(where.AND, rangedKey);
    if (this.isValidDate(queryValue)) {
      if (keyIndex !== -1) {
        where.AND[keyIndex][rangedKey][comparison] = new Date(queryValue);
      } else {
        where.AND.push({
          [`${rangedKey}`]: {
            [`${comparison}`]: new Date(queryValue),
          },
        });
      }
    } else if (!isNaN(parseInt(queryValue))) {
      if (keyIndex !== -1) {
        where.AND[keyIndex][rangedKey][comparison] = parseInt(queryValue);
      } else {
        where.AND.push({
          [`${rangedKey}`]: {
            [`${comparison}`]: parseInt(queryValue),
          },
        });
      }
    }
  }
}
