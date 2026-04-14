<?php
/**
 * Plugin Name: YourBrain Shindan Bridge
 * Description: 社長の形勢診断の保存・一覧管理用ブリッジプラグイン。
 * Version: 0.1.0
 */

if (!defined('ABSPATH')) {
	exit;
}

final class YourBrain_Shindan_Bridge {
	private string $table_name;
	private string $token_option_name = 'yourbrain_shindan_api_token';

	public function __construct() {
		global $wpdb;
		$this->table_name = $wpdb->prefix . 'yourbrain_shindan_submissions';

		register_activation_hook(__FILE__, [$this, 'activate']);
		add_action('rest_api_init', [$this, 'register_rest_routes']);
		add_action('admin_menu', [$this, 'register_admin_page']);
	}

	public function activate(): void {
		global $wpdb;

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$charset_collate = $wpdb->get_charset_collate();
		$sql = "CREATE TABLE {$this->table_name} (
			id varchar(64) NOT NULL,
			created_at datetime NOT NULL,
			company_name varchar(255) NOT NULL,
			contact_name varchar(255) NOT NULL,
			email varchar(255) NOT NULL,
			phone varchar(64) NULL,
			consent tinyint(1) NOT NULL DEFAULT 0,
			overall_phase varchar(64) NOT NULL,
			evaluation_value int NOT NULL,
			evaluation_label varchar(64) NOT NULL,
			grade varchar(8) NOT NULL,
			total_score int NOT NULL,
			answers longtext NOT NULL,
			result_json longtext NOT NULL,
			PRIMARY KEY  (id),
			KEY created_at (created_at),
			KEY email (email)
		) $charset_collate;";

		dbDelta($sql);
	}

	public function register_rest_routes(): void {
		register_rest_route('yourbrain-shindan/v1', '/submissions', [
			'methods' => 'POST',
			'callback' => [$this, 'create_submission'],
			'permission_callback' => [$this, 'authorize_api'],
		]);

		register_rest_route('yourbrain-shindan/v1', '/submissions/(?P<id>[a-zA-Z0-9\-]+)', [
			'methods' => 'GET',
			'callback' => [$this, 'get_submission'],
			'permission_callback' => [$this, 'authorize_api'],
		]);
	}

	public function authorize_api(): bool {
		if (current_user_can('manage_options')) {
			return true;
		}

		$configured_token = $this->get_api_token();
		$request_token = $this->get_request_token();

		if (!$configured_token || !$request_token) {
			return false;
		}

		return hash_equals($configured_token, $request_token);
	}

	private function get_api_token(): string {
		if (defined('YOURBRAIN_SHINDAN_API_TOKEN') && YOURBRAIN_SHINDAN_API_TOKEN) {
			return (string) YOURBRAIN_SHINDAN_API_TOKEN;
		}

		$env_token = getenv('YOURBRAIN_SHINDAN_API_TOKEN');

		if (is_string($env_token) && $env_token !== '') {
			return $env_token;
		}

		$option_token = get_option($this->token_option_name, '');

		return is_string($option_token) ? $option_token : '';
	}

	private function get_request_token(): string {
		$header_token = isset($_SERVER['HTTP_X_YOURBRAIN_SHINDAN_TOKEN'])
			? sanitize_text_field(wp_unslash($_SERVER['HTTP_X_YOURBRAIN_SHINDAN_TOKEN']))
			: '';

		if ($header_token !== '') {
			return $header_token;
		}

		$param_token = isset($_GET['token']) ? sanitize_text_field(wp_unslash($_GET['token'])) : '';

		return $param_token;
	}

	public function create_submission(WP_REST_Request $request): WP_REST_Response {
		global $wpdb;

		$params = $request->get_json_params();
		$lead = isset($params['lead']) ? $params['lead'] : [];
		$result = isset($params['result']) ? $params['result'] : [];

		$wpdb->insert(
			$this->table_name,
			[
				'id' => sanitize_text_field($params['id']),
				'created_at' => gmdate('Y-m-d H:i:s', strtotime($params['createdAt'])),
				'company_name' => sanitize_text_field($lead['companyName'] ?? ''),
				'contact_name' => sanitize_text_field($lead['contactName'] ?? ''),
				'email' => sanitize_email($lead['email'] ?? ''),
				'phone' => sanitize_text_field($lead['phone'] ?? ''),
				'consent' => !empty($lead['consent']) ? 1 : 0,
				'overall_phase' => sanitize_text_field($result['overallPhase'] ?? ''),
				'evaluation_value' => intval($result['evaluationValue'] ?? 0),
				'evaluation_label' => sanitize_text_field($result['evaluationLabel'] ?? ''),
				'grade' => sanitize_text_field($result['grade'] ?? ''),
				'total_score' => intval($result['totalScore'] ?? 0),
				'answers' => wp_json_encode($params['answers'], JSON_UNESCAPED_UNICODE),
				'result_json' => wp_json_encode($result, JSON_UNESCAPED_UNICODE),
			],
			['%s', '%s', '%s', '%s', '%s', '%s', '%d', '%s', '%d', '%s', '%s', '%d', '%s', '%s']
		);

		return new WP_REST_Response(['id' => sanitize_text_field($params['id'])], 201);
	}

	public function get_submission(WP_REST_Request $request): WP_REST_Response {
		global $wpdb;

		$id = sanitize_text_field($request['id']);
		$row = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$this->table_name} WHERE id = %s", $id), ARRAY_A);

		if (!$row) {
			return new WP_REST_Response(['message' => 'Not found'], 404);
		}

		return new WP_REST_Response([
			'id' => $row['id'],
			'createdAt' => get_date_from_gmt($row['created_at'], DATE_ATOM),
			'lead' => [
				'companyName' => $row['company_name'],
				'contactName' => $row['contact_name'],
				'email' => $row['email'],
				'phone' => $row['phone'],
				'consent' => (bool) $row['consent'],
			],
			'answers' => json_decode($row['answers'], true),
			'result' => json_decode($row['result_json'], true),
		], 200);
	}

	public function register_admin_page(): void {
		add_menu_page(
			'社長の形勢診断',
			'社長の形勢診断',
			'manage_options',
			'yourbrain-shindan',
			[$this, 'render_admin_page'],
			'dashicons-chart-line',
			26
		);
	}

	public function render_admin_page(): void {
		global $wpdb;
		$rows = $wpdb->get_results("SELECT * FROM {$this->table_name} ORDER BY created_at DESC LIMIT 100", ARRAY_A);
		?>
		<div class="wrap">
			<h1>社長の形勢診断 一覧</h1>
			<table class="widefat striped">
				<thead>
					<tr>
						<th>日時</th>
						<th>会社名</th>
						<th>お名前</th>
						<th>メール</th>
						<th>判定</th>
						<th>評価値</th>
						<th>スコア</th>
					</tr>
				</thead>
				<tbody>
					<?php foreach ($rows as $row) : ?>
						<tr>
							<td><?php echo esc_html($row['created_at']); ?></td>
							<td><?php echo esc_html($row['company_name']); ?></td>
							<td><?php echo esc_html($row['contact_name']); ?></td>
							<td><?php echo esc_html($row['email']); ?></td>
							<td><?php echo esc_html($row['overall_phase']); ?></td>
							<td><?php echo esc_html($row['evaluation_value']); ?></td>
							<td><?php echo esc_html($row['grade']); ?> / <?php echo esc_html($row['total_score']); ?></td>
						</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
		</div>
		<?php
	}
}

new YourBrain_Shindan_Bridge();
