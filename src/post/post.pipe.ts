/* eslint-disable prefer-const */
import { HttpException, Injectable, PipeTransform } from '@nestjs/common';
import { PostQueryExtract } from 'src/model/post.model';

const validUserKey = ['username', 'email'];
const validSortKey = ['id', 'createdAt'];
const validRangedKey = ['createdAt', 'publishedAt'];
const validSearchKey = [...validUserKey, 'title', 'content'];
const validFilterKey = [
  ...validUserKey,
  'title',
  'isPublished',
  ...validRangedKey,
];

@Injectable()
export class QueryPostPipe implements PipeTransform {
  transform(value: any) {
    let where = { AND: [] };
    let page = 1;
    const rows = 5;
    const orderBy = {};
    if (!value) {
      return { page, rows };
    }
    for (const key in value) {
      if (value[key])
        if (key === 'page') {
          page = value.page ? parseInt(value.page) : 1;
          if (isNaN(page))
            throw new HttpException('Query Page Parse Invalid', 400);
        } else if (key === 'rows') {
          const rows = value.rows ? parseInt(value.rows) : 5;
          if (isNaN(rows))
            throw new HttpException('Query Rows Parse Invalid', 400);
        } else if (key === 'isPublished') {
          if (value.isPublished === '1') where['isPublished'] = true;
          else if (value.isPublished === '0') where['isPublished'] = false;
          else throw new HttpException(`Invalid isPublished Value`, 400);
        } else if (key.includes('sort')) {
          this.buildSortKey(orderBy, value.sort);
        } else if (key.includes('lt') || key.includes('gt')) {
          this.buildRangedKey(where, key, value[key]);
        } else if (key.includes('search')) {
          this.buildSearchKey(where, key, value[key]);
        } else {
          this.buildFilterQuery(where, key, value[key]);
        }
    }

    const result: PostQueryExtract = {
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

  private buildSearchKey(where: any, key: string, queryValue: string) {
    const searchKey = key.split('.')[1];

    if (!validSearchKey.includes(searchKey))
      throw new HttpException(
        `Invalid key for search. Available search key ${validSearchKey.join(', ')}`,
        400,
      );

    if (validUserKey.includes(searchKey)) {
      const keyIndex = this.isANDHaveTheKey(where.AND, 'user');
      if (keyIndex !== -1) {
        where.AND[keyIndex]['user'][searchKey] = { contains: queryValue };
      } else {
        where.AND.push({
          [`${'user'}`]: {
            [`${searchKey}`]: { contains: queryValue },
          },
        });
      }
      return;
    }

    const keyIndex = this.isANDHaveTheKey(where.AND, searchKey);
    if (keyIndex !== -1) {
      where.AND[keyIndex][searchKey] = { contains: queryValue };
    } else {
      where.AND.push({
        [`${searchKey}`]: { contains: queryValue },
      });
    }
  }

  private buildFilterQuery(where: any, filterKey: string, queryValue: string) {
    if (!validSearchKey.includes(filterKey))
      throw new HttpException(
        `Invalid key for filter. Available filter key ${validFilterKey.join(', ')}`,
        400,
      );

    if (validUserKey.includes(filterKey)) {
      const keyIndex = this.isANDHaveTheKey(where.AND, 'user');
      if (keyIndex !== -1) {
        where.AND[keyIndex]['user'][filterKey] = queryValue;
      } else {
        where.AND.push({
          [`${'user'}`]: {
            [`${filterKey}`]: queryValue,
          },
        });
      }
      return;
    }

    const keyIndex = this.isANDHaveTheKey(where.AND, filterKey);
    if (this.isValidDate(queryValue)) {
      if (keyIndex !== -1) {
        where.AND[keyIndex][filterKey] = new Date(queryValue);
      } else {
        where.AND.push({
          [`${filterKey}`]: new Date(queryValue),
        });
      }
    } else if (!isNaN(parseInt(queryValue))) {
      if (keyIndex !== -1) {
        where.AND[keyIndex][filterKey] = parseInt(queryValue);
      } else {
        where.AND.push({
          [`${filterKey}`]: parseInt(queryValue),
        });
      }
    } else {
      if (keyIndex !== -1) {
        where.AND[keyIndex][filterKey] = queryValue;
      } else {
        where.AND.push({
          [`${filterKey}`]: queryValue,
        });
      }
    }
  }
}
