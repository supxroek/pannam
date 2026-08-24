# Database Structure

## Table `_prisma_migrations`

### Columns

| Name                  | Type          | Constraints |
| :-------------------- | :------------ | :---------- |
| `id`                  | `varchar`     | Primary     |
| `checksum`            | `varchar`     |             |
| `finished_at`         | `timestamptz` | Nullable    |
| `migration_name`      | `varchar`     |             |
| `logs`                | `text`        | Nullable    |
| `rolled_back_at`      | `timestamptz` | Nullable    |
| `started_at`          | `timestamptz` |             |
| `applied_steps_count` | `int4`        |             |

---

## Table `villages`

### Columns

| Name               | Type            | Constraints |
| :----------------- | :-------------- | :---------- |
| `village_id`       | `int4`          | Primary     |
| `address`          | `text`          | Nullable    |
| `sub_district`     | `varchar`       | Nullable    |
| `district`         | `varchar`       | Nullable    |
| `province`         | `varchar`       | Nullable    |
| `postal_code`      | `varchar`       | Nullable    |
| `payment_method`   | `PaymentMethod` |             |
| `bank_provider`    | `varchar`       | Nullable    |
| `bank_number`      | `varchar`       | Nullable    |
| `bank_payee_name`  | `varchar`       | Nullable    |
| `promptpay_no`     | `varchar`       | Nullable    |
| `promptpay_name`   | `varchar`       | Nullable    |
| `promptpay_image`  | `text`          | Nullable    |
| `enable_promptpay` | `bool`          |             |
| `is_active`        | `bool`          |             |
| `created_at`       | `timestamp`     |             |
| `updated_at`       | `timestamp`     |             |

---

## Table `users`

### Columns

| Name               | Type        | Constraints      |
| :----------------- | :---------- | :--------------- |
| `user_id`          | `int4`      | Primary          |
| `line_user_id`     | `varchar`   | Unique           |
| `line_profile_url` | `text`      | Nullable         |
| `full_name`        | `varchar`   |                  |
| `birth_date`       | `date`      | Nullable         |
| `national_id`      | `varchar`   | Unique, Nullable |
| `phone_number`     | `varchar`   | Nullable         |
| `is_global_admin`  | `bool`      |                  |
| `created_at`       | `timestamp` |                  |
| `updated_at`       | `timestamp` |                  |

---

## Table `user_villages`

### Columns

| Name              | Type                | Constraints |
| :---------------- | :------------------ | :---------- |
| `user_village_id` | `int4`              | Primary     |
| `user_id`         | `int4`              | Foreign Key |
| `village_id`      | `int4`              | Foreign Key |
| `role`            | `Role`              |             |
| `status`          | `UserVillageStatus` |             |
| `created_at`      | `timestamp`         |             |

---

## Table `properties`

### Columns

| Name           | Type             | Constraints |
| :------------- | :--------------- | :---------- |
| `property_id`  | `int4`           | Primary     |
| `village_id`   | `int4`           | Foreign Key |
| `house_number` | `varchar`        |             |
| `zone`         | `varchar`        | Nullable    |
| `meter_code`   | `varchar`        | Nullable    |
| `status`       | `PropertyStatus` |             |
| `created_at`   | `timestamp`      |             |
| `updated_at`   | `timestamp`      |             |

---

## Table `user_properties`

### Columns

| Name               | Type        | Constraints |
| :----------------- | :---------- | :---------- |
| `user_property_id` | `int4`      | Primary     |
| `user_id`          | `int4`      | Foreign Key |
| `property_id`      | `int4`      | Foreign Key |
| `created_at`       | `timestamp` |             |
| `updated_at`       | `timestamp` |             |

---

## Table `water_rates`

### Columns

| Name             | Type        | Constraints |
| :--------------- | :---------- | :---------- |
| `rate_id`        | `int4`      | Primary     |
| `village_id`     | `int4`      | Foreign Key |
| `min_unit`       | `numeric`   |             |
| `max_unit`       | `numeric`   | Nullable    |
| `price_per_unit` | `numeric`   |             |
| `created_at`     | `timestamp` |             |
| `updated_at`     | `timestamp` |             |

---

## Table `meter_readings`

### Columns

| Name               | Type        | Constraints           |
| :----------------- | :---------- | :-------------------- |
| `reading_id`       | `int4`      | Primary               |
| `village_id`       | `int4`      | Foreign Key           |
| `property_id`      | `int4`      | Foreign Key           |
| `reader_id`        | `int4`      | Foreign Key, Nullable |
| `previous_reading` | `numeric`   |                       |
| `current_reading`  | `numeric`   |                       |
| `consumption`      | `numeric`   |                       |
| `image_url`        | `text`      | Nullable              |
| `reading_date`     | `date`      |                       |
| `created_at`       | `timestamp` |                       |

---

## Table `invoices`

### Columns

| Name               | Type            | Constraints         |
| :----------------- | :-------------- | :------------------ |
| `invoice_id`       | `int4`          | Primary             |
| `meter_reading_id` | `int4`          | Unique, Foreign Key |
| `water_amount`     | `numeric`       |                     |
| `service_fee`      | `numeric`       |                     |
| `fine_amount`      | `numeric`       |                     |
| `total_amount`     | `numeric`       |                     |
| `payment_status`   | `InvoiceStatus` |                     |
| `due_date`         | `date`          |                     |
| `created_at`       | `timestamp`     |                     |
| `updated_at`       | `timestamp`     |                     |

---

## Table `payments`

### Columns

| Name                  | Type                | Constraints           |
| :-------------------- | :------------------ | :-------------------- |
| `payment_id`          | `int4`              | Primary               |
| `invoice_id`          | `int4`              | Foreign Key           |
| `paid_by_user_id`     | `int4`              | Foreign Key, Nullable |
| `amount_paid`         | `numeric`           |                       |
| `slip_url`            | `text`              |                       |
| `verified_by_user_id` | `int4`              | Foreign Key, Nullable |
| `payment_status`      | `PaymentSlipStatus` |                       |
| `reject_reason`       | `text`              | Nullable              |
| `verified_at`         | `timestamp`         | Nullable              |
| `created_at`          | `timestamp`         |                       |

---

## Table `audit_logs`

### Columns

| Name         | Type        | Constraints           |
| :----------- | :---------- | :-------------------- |
| `log_id`     | `int4`      | Primary               |
| `village_id` | `int4`      | Foreign Key, Nullable |
| `user_id`    | `int4`      | Foreign Key, Nullable |
| `action`     | `varchar`   |                       |
| `table_name` | `varchar`   |                       |
| `record_id`  | `int4`      |                       |
| `old_data`   | `jsonb`     | Nullable              |
| `new_data`   | `jsonb`     | Nullable              |
| `created_at` | `timestamp` |                       |

---

## Custom Types / Enums

### `InvoiceStatus`

- `pending`
- `verifying`
- `paid_cash`
- `paid_online`
- `overdue`

### `PaymentMethod`

- `bank`
- `promptpay`

### `PaymentSlipStatus`

- `submitted`
- `approved`
- `rejected`

### `PropertyStatus`

- `active`
- `suspended`

### `Role`

- `village_admin`
- `meter_reader`
- `resident`

### `UserVillageStatus`

- `active`
- `suspended`
